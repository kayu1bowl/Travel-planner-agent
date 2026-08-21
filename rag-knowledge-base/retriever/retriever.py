"""
Retriever — 多策略 RAG 检索器（双后端：FAISS / Chroma）

自动检测后端：
  1. 如果 Chroma 集合存在 → 使用 Chroma 查询
  2. 否则 → 使用 FAISS 索引 + metadata.json

策略链：HyDE → Multi-Query → Dense Retrieval → Reranker
"""

import json
import os
import sys
from pathlib import Path
from typing import List, Optional, Dict, Any

# 动态查找项目根
_root = Path(__file__).resolve()
for p in [_root, *_root.parents]:
    if (p / "rag_knowledge_base").is_dir():
        if str(p) not in sys.path:
            sys.path.insert(0, str(p))
        break

import numpy as np
import faiss
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.core.postprocessor import SentenceTransformerRerank

from rag_knowledge_base.config import (
    VECTOR_DIR, CHROMA_DIR, EMBEDDING_MODEL, RERANKER_MODEL, EMBED_BACKEND,
    RERANK_TOP_K,
    USE_HYDE, USE_BM25, NUM_QUERY_VARIANTS, COLLECTION_NAME, VECTOR_BACKEND,
    ENABLE_RERANK,
    get_vector_dir,
)


META_FILE = VECTOR_DIR / "metadata.json"
INDEX_FILE = VECTOR_DIR / "faiss.index"


_COUNTRY_META_CACHE = {}  # {country: [chunks]}


def _detect_backend() -> str:
    """自动检测使用的后端（但优先尊重用户显式声明的 VECTOR_BACKEND 环境变量）"""
    explicit = os.environ.get("VECTOR_BACKEND", "").lower().strip()
    if explicit in ("chroma", "faiss"):
        return explicit
    # 未显式声明 → 自动检测
    chroma_dir = Path(str(CHROMA_DIR))
    if chroma_dir.exists() and (chroma_dir / "chroma.sqlite3").exists():
        return "chroma"
    if INDEX_FILE.exists():
        return "faiss"
    # 从 config 读取
    return VECTOR_BACKEND


def create_embed_model():
    """创建 embedding 模型实例（与 builder.py 一致，本地优先）"""
    # ★ 在所有 import 之前设离线环境变量，阻止一切联网
    import os as _os
    _old_offline_hf = _os.environ.get("HF_HUB_OFFLINE")
    _old_offline_tr = _os.environ.get("TRANSFORMERS_OFFLINE")
    _os.environ["HF_HUB_OFFLINE"] = "1"
    _os.environ["TRANSFORMERS_OFFLINE"] = "1"

    from llama_index.embeddings.huggingface import HuggingFaceEmbedding

    is_qwen = EMBED_BACKEND.startswith("qwen") or "qwen" in str(EMBEDDING_MODEL).lower()

    try:
        if is_qwen:
            model = HuggingFaceEmbedding(
                model_name=EMBEDDING_MODEL,
                trust_remote_code=True,
                query_instruction="为这个句子生成表示以用于检索相关文章：",
            )
            print(f"  📐 Qwen 模型已加载（本地） | instruction 前缀已启用")
        else:
            model = HuggingFaceEmbedding(
                model_name=EMBEDDING_MODEL,
                trust_remote_code=True,
            )
            print(f"  📐 BGE 模型已加载（本地）")
    except Exception as e:
        # 本地没有，放联网下载
        if _old_offline_hf is None:
            del _os.environ["HF_HUB_OFFLINE"]
        else:
            _os.environ["HF_HUB_OFFLINE"] = _old_offline_hf
        if _old_offline_tr is None:
            del _os.environ["TRANSFORMERS_OFFLINE"]
        else:
            _os.environ["TRANSFORMERS_OFFLINE"] = _old_offline_tr
        print(f"  🔍 本地缓存未找到 ({e})")
        print(f"  📡 尝试联网下载模型: {EMBEDDING_MODEL}")
        if is_qwen:
            model = HuggingFaceEmbedding(
                model_name=EMBEDDING_MODEL,
                trust_remote_code=True,
                query_instruction="为这个句子生成表示以用于检索相关文章：",
            )
            print(f"  📐 Qwen 模型已加载（联网） | instruction 前缀已启用")
        else:
            model = HuggingFaceEmbedding(
                model_name=EMBEDDING_MODEL,
                trust_remote_code=True,
            )
            print(f"  📐 BGE 模型已加载（联网）")
    else:
        if _old_offline_hf is None:
            del _os.environ["HF_HUB_OFFLINE"]
        else:
            _os.environ["HF_HUB_OFFLINE"] = _old_offline_hf
        if _old_offline_tr is None:
            del _os.environ["TRANSFORMERS_OFFLINE"]
        else:
            _os.environ["TRANSFORMERS_OFFLINE"] = _old_offline_tr
    try:
        if hasattr(model, '_model'):
            dim_fn = getattr(model._model, 'get_sentence_embedding_dimension', None) or \
                     getattr(model._model, 'get_sentence_embedding_dimension', None)
            dim = dim_fn() if dim_fn else "?"
        else:
            dim = "?"
        print(f"  📏 模型维度: {dim}")
    except:
        pass
    return model







def _format_results(results: List[Dict]) -> str:
    """格式化检索结果为可读文本（供 OpenClaw 智能体调用）"""
    if not results:
        return "【知识库检索】未找到相关内容，建议调用联网搜索。"
    output = f"【知识库检索结果】共 {len(results)} 条：\n\n"
    for i, r in enumerate(results, 1):
        m = r["metadata"]
        score = r.get("score", "?")
        output += f"--- 片段 {i} (score={score}) ---\n"
        output += f"\U0001f4c4 {m.get('source_name', '未知')} | \U0001f3f7\ufe0f {m.get('category', '未分类')}\n"
        output += f"\U0001f4dd {r['content']}\n\n"
    return output


# ===================================================================
# FAISS 检索器
# ===================================================================

class FAISSRetriever:
    def __init__(self, top_k, embed_model, use_reranker, reranker_model, chunks):
        self.top_k = top_k
        self.embed_model = embed_model
        self.use_reranker = use_reranker
        self.chunks = chunks
        self.chunk_map = {c["id"]: c for c in chunks}

        self.index = faiss.read_index(str(INDEX_FILE))
        print(f"  \U0001f4ca FAISS 索引已加载: {self.index.ntotal} 向量, 维度 {self.index.d}")

        if use_reranker:
            self.reranker = SentenceTransformerRerank(
                model=reranker_model,
                top_k=top_k,
            )
        else:
            self.reranker = None

        # BM25 索引（初始化时构建一次）
        self.bm25 = None
        self.bm25_chunks = []
        try:
            texts = [c["text"] for c in chunks]
            if texts:
                from rank_bm25 import BM25Okapi
                import jieba
                tokenized_corpus = []
                for t in texts:
                    # 对中文文本分词
                    words = list(jieba.cut(t))
                    tokenized_corpus.append(words)
                self.bm25 = BM25Okapi(tokenized_corpus)
                self.bm25_chunks = chunks
                print(f"  \U0001f4d6 BM25 索引已构建: {len(chunks)} 文档")
        except ImportError:
            print(f"  \u26a0\ufe0f rank_bm25 未安装，跳过 BM25")
        except Exception as e:
            print(f"  \u26a0\ufe0f BM25 初始化失败: {e}")

    def _encode_query(self, query: str) -> np.ndarray:
        emb = self.embed_model.get_query_embedding(query)
        return np.array([emb]).astype(np.float32)

    def _match_where(self, metadata: Dict, where: Optional[Dict]) -> bool:
        """检查 metadata 是否匹配 where 条件（简单的等值匹配）"""
        if not where:
            return True
        for key, val in where.items():
            if metadata.get(key) != val:
                return False
        return True

    def search(self, query: str, k: int, where: Optional[Dict] = None) -> List[Dict]:
        # 如果有 where 条件，需要对 chunks 预过滤
        active_chunks = self.chunks
        query_multiplier = 1
        
        if where:
            active_chunks = [c for c in self.chunks if self._match_where(c.get("metadata", {}), where)]
            if not active_chunks:
                return []
            # 需要多拉一些候选（过滤后变少了）
            query_multiplier = max(1, len(self.chunks) // max(len(active_chunks), 1))

        # 标准 FAISS 搜索
        vec = self._encode_query(query)
        effective_k = min(k * query_multiplier, len(self.chunks))
        distances, indices = self.index.search(vec, effective_k)
        
        results = []
        seen = set()
        for dist, idx in zip(distances[0], indices[0]):
            if idx < 0 or idx >= len(self.chunks):
                continue
            chunk = self.chunks[idx]
            # 应用 where 过滤
            if where and not self._match_where(chunk.get("metadata", {}), where):
                continue
            text_key = chunk["text"][:100]
            if text_key in seen:
                continue
            seen.add(text_key)
            results.append({
                "content": chunk["text"],
                "metadata": chunk.get("metadata", {}),
                "score": round(float(dist), 4),
            })
            if len(results) >= k:
                break
        return results

    def bm25_search(self, query: str, k: int) -> List[Dict]:
        """BM25 关键词检索（与 dense 形成互补）"""
        if self.bm25 is None:
            return []
        import jieba
        tokenized_query = list(jieba.cut(query))
        scores = self.bm25.get_scores(tokenized_query)
        # 获取 top-k 索引
        top_indices = sorted(
            range(len(scores)), key=lambda i: scores[i], reverse=True
        )[:k]
        results = []
        for idx in top_indices:
            if scores[idx] == 0:
                continue
            results.append({
                "content": self.bm25_chunks[idx]["text"],
                "metadata": self.bm25_chunks[idx].get("metadata", {}),
                "score": round(float(scores[idx]), 4),
            })
        return results

    def rerank(self, query: str, results: List[Dict], k: int) -> List[Dict]:
        if not self.reranker or not results:
            return results[:k]
        try:
            from llama_index.core.schema import QueryBundle, NodeWithScore, TextNode
            nodes = [NodeWithScore(node=TextNode(text=r["content"], metadata=r["metadata"]), score=r["score"]) for r in results]
            reranked = self.reranker.postprocess_nodes(nodes, query_bundle=QueryBundle(query_str=query))
            return [{"content": n.text, "metadata": n.metadata, "score": round(float(n.score), 4) if n.score else None} for n in reranked[:k]]
        except Exception:
            return results[:k]


# ===================================================================
# Chroma 检索器
# ===================================================================

class ChromaRetriever:
    def __init__(self, top_k, embed_model, use_reranker, reranker_model):
        self.top_k = top_k
        self.embed_model = embed_model
        self.use_reranker = use_reranker

        import chromadb
        self.client = chromadb.PersistentClient(path=str(CHROMA_DIR))
        try:
            self.collection = self.client.get_collection(COLLECTION_NAME)
        except Exception as e:
            raise FileNotFoundError(f"Chroma 集合 [{COLLECTION_NAME}] 不存在: {e}，请先运行 builder --backend chroma")

        count = self.collection.count()
        print(f"  \U0001f4ca Chroma 集合已加载: {count} 条")

        if use_reranker:
            self.reranker = SentenceTransformerRerank(
                model=reranker_model,
                top_k=top_k,
            )
        else:
            self.reranker = None

    def search(self, query: str, k: int, where: Optional[Dict[str, Any]] = None) -> List[Dict]:
        """检索：支持通过 where 过滤 metadata（如 {"category": "food"}）

        Chroma hnsw:space=cosine 返回的是余弦距离（0=相同, 2=相反），
        这里统一转换为相似度 1 - distance，使 score 语义与 FAISS IndexFlatIP
        一致（higher=better）。
        """
        query_emb = self.embed_model.get_query_embedding(query)
        kw = {
            "query_embeddings": [query_emb],
            "n_results": k,
        }
        if where:
            kw["where"] = where
        results = self.collection.query(**kw)
        formatted = []
        if not results["ids"] or not results["ids"][0]:
            return formatted
        for i in range(len(results["ids"][0])):
            meta = results["metadatas"][0][i] if results["metadatas"] else {}
            # Chroma cosine distance → similarity score（higher=better）
            raw_dist = float(results["distances"][0][i]) if results.get("distances") else None
            score = round(1.0 - raw_dist, 4) if raw_dist is not None else None
            formatted.append({
                "content": results["documents"][0][i] if results["documents"] else "",
                "metadata": meta or {},
                "score": score,
            })
        return formatted

    def rerank(self, query: str, results: List[Dict], k: int) -> List[Dict]:
        if not self.reranker or not results:
            return results[:k]
        try:
            from llama_index.core.schema import QueryBundle, NodeWithScore, TextNode
            nodes = [NodeWithScore(node=TextNode(text=r["content"], metadata=r["metadata"]), score=r["score"] or 0) for r in results]
            reranked = self.reranker.postprocess_nodes(nodes, query_bundle=QueryBundle(query_str=query))
            return [{"content": n.text, "metadata": n.metadata, "score": round(float(n.score), 4) if n.score else None} for n in reranked[:k]]
        except Exception:
            return results[:k]


# ===================================================================
# 统一 RAG 检索器
# ===================================================================

class RAGRetriever:
    def __init__(
        self,
        top_k: int = RERANK_TOP_K,
        use_hyde: bool = USE_HYDE,
        use_multi_query: bool = True,
        use_reranker: bool = ENABLE_RERANK,
        use_bm25: bool = USE_BM25,
        reranker_model: str = RERANKER_MODEL,
    ):
        self.top_k = top_k
        self.use_hyde = use_hyde
        self.use_multi_query = use_multi_query
        self.use_reranker = use_reranker
        self.use_bm25 = use_bm25

        self.embed_model = create_embed_model()

        # 自动检测后端
        backend = _detect_backend()

        if backend == "chroma":
            print(f"  \U0001f5b1\ufe0f  检索后端: ChromaDB")
            self._backend = "chroma"
            self.chroma = ChromaRetriever(top_k, self.embed_model, use_reranker, reranker_model)
            self.faiss = None
        else:
            print(f"  \U0001f5b1\ufe0f  检索后端: FAISS")
            self._backend = "faiss"
            if not INDEX_FILE.exists():
                raise FileNotFoundError(f"FAISS 索引不存在: {INDEX_FILE}，请先运行 builder.py")
            if not META_FILE.exists():
                raise FileNotFoundError(f"元数据不存在: {META_FILE}")
            with open(META_FILE, "r", encoding="utf-8") as f:
                chunks = json.load(f)
            print(f"  \U0001f4dd 元数据已加载: {len(chunks)} 条")
            self.faiss = FAISSRetriever(top_k, self.embed_model, use_reranker, reranker_model, chunks)
            self.chroma = None

        strategies = []
        if use_bm25: strategies.append("BM25")
        if use_hyde: strategies.append("HyDE")
        if use_multi_query: strategies.append("MultiQuery")
        if use_reranker: strategies.append("Reranker")
        self._country = "nz"
        self._country_name = "New Zealand"
        print(f"\u2705 RAG 就绪 | {backend.upper()} | TopK: {top_k} | 策略: {'+'.join(strategies)}")

    def set_country(self, country: str):
        """设置检索目标国家"""
        # LLM 自主识别国家，系统层不预设白名单
        self._country = country
        self._country_name = country.upper()
        print(f"  🌍 检索目标: {country.upper()}")

    def _generate_hyde_doc(self, query: str) -> str:
        cn = self._country_name
        return (
            f"As a travel guide for {cn}, here is detailed information about '{query}': "
            f"This covers key aspects of traveling to and experiencing {cn}, "
            f"including practical tips, cultural insights, natural attractions, "
            f"and recommended activities related to {query}. "
            f"Visitors will find this useful for planning their trip."
        )

    def _generate_query_variants(self, query: str) -> List[str]:
        cn = self._country_name
        variants = [query]
        if all('\u4e00' <= c <= '\u9fff' or c in ' \uff0c\u3002\uff01\uff1f' for c in query):
            variants.append(f"{cn} {query}")
        else:
            variants.append(query)
        seen = set()
        unique = []
        for v in variants:
            if v not in seen:
                seen.add(v)
                unique.append(v)
        return unique[:NUM_QUERY_VARIANTS]

    def search(
        self,
        query: str,
        top_k: Optional[int] = None,
        where: Optional[Dict[str, Any]] = None,
        country: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        # 自动检测国家（如果未显式设置）
        if country:
            self.set_country(country)
        # 如果 query 暗示了特定国家，自动加入 country where 条件
        if self._country != "nz":
            if where is None:
                where = {}
            if "country" not in where:
                where["country"] = self._country
        k = top_k or self.top_k

        search_queries = [query]
        if self.use_hyde:
            search_queries.append(self._generate_hyde_doc(query))
        if self.use_multi_query:
            for v in self._generate_query_variants(query):
                if v not in search_queries:
                    search_queries.append(v)

        # 多查询合并
        all_results = []
        seen_texts = set()
        mult = k * 2

        if self._backend == "chroma":
            for q in search_queries:
                results = self.chroma.search(q, mult, where=where)
                for r in results:
                    text_key = r["content"][:100]
                    if text_key not in seen_texts:
                        seen_texts.add(text_key)
                        all_results.append(r)
            all_results.sort(key=lambda r: r["score"] or 0, reverse=True)
            if self.use_reranker:
                return self.chroma.rerank(query, all_results, k)
            return all_results[:k]
        else:
            for q in search_queries:
                results = self.faiss.search(q, mult, where=where)
                for r in results:
                    text_key = r["content"][:100]
                    if text_key not in seen_texts:
                        seen_texts.add(text_key)
                        all_results.append(r)
            all_results.sort(key=lambda r: r["score"], reverse=True)

            # BM25 混合检索（倒排融合）
            if self.use_bm25:
                bm25_results = self.faiss.bm25_search(query, mult)
                for r in bm25_results:
                    text_key = r["content"][:100]
                    if text_key not in seen_texts:
                        seen_texts.add(text_key)
                        all_results.append(r)

                # Reciprocal Rank Fusion (RRF) 融合
                if bm25_results:
                    dense_ids = {r["content"][:100]: i for i, r in enumerate(all_results)}
                    fused = []
                    for r in all_results:
                        fused.append(r)
                    # Sort by RRF score: sum(1/(k + rank)) for each result in each ranking
                    dense_ranked = {r["content"][:100]: i+1 for i, r in enumerate(all_results)}
                    bm25_ranked = {r["content"][:100]: i+1 for i, r in enumerate(bm25_results)}
                    rrfs = {}
                    for key in dense_ranked:
                        dr = dense_ranked[key]
                        br = bm25_ranked.get(key, 999)
                        rrfs[key] = 1/(60 + dr) + 1/(60 + br)
                    fused.sort(key=lambda r: rrfs.get(r["content"][:100], 0), reverse=True)
                    all_results = fused

            if self.use_reranker:
                return self.faiss.rerank(query, all_results, k)
            return all_results[:k]

    def count(self) -> int:
        if self._backend == "chroma":
            return self.chroma.collection.count()
        return self.faiss.index.ntotal


# ===================================================================
# 便捷调用
# ===================================================================

def rag_search(query: str, top_k: int = 5, where: Optional[Dict[str, Any]] = None) -> str:
    """供 OpenClaw 智能体调用

    Args:
        query: 搜索关键词
        top_k: 返回条数
        where: 可选 metadata 过滤条件，如 {"category": "food"}
               Chroma 后端时传递给 collection.query(where=...)
    """
    try:
        retriever = RAGRetriever(top_k=top_k)
        results = retriever.search(query, where=where)
        return _format_results(results)
    except Exception as e:
        return f"【知识库检索】失败: {str(e)}"


# ===================================================================
# 检索质量评估（原 eval_retriever.py，合并至此）
# ===================================================================


def _load_chunks() -> list:
    """加载 metadata.json"""
    fp = VECTOR_DIR / "metadata.json"
    if not fp.exists():
        print("⚠️  metadata.json 不存在，请先构建知识库")
        return []
    with open(fp, "r", encoding="utf-8") as f:
        return json.load(f)


def _make_query_from_chunk(chunk: dict) -> str:
    """从 chunk 生成一个自然语言查询"""
    meta = chunk.get("metadata", {})
    title = meta.get("section_title", "") or meta.get("title", "")
    text = chunk.get("text", "")
    first_sentence = text.split("。")[0] if "。" in text else text[:30]
    if title:
        return f"{title} {first_sentence}"
    return first_sentence


def evaluate_retrieval(
    retriever: RAGRetriever,
    n_samples: int = 50,
    top_k: int = 5,
) -> dict:
    """
    评估检索质量（MRR / Recall@k）。

    Args:
        retriever: 已初始化的 RAGRetriever
        n_samples: 采样数量
        top_k: 检索 top-k

    Returns: {"mrr", "recall_at_1", "recall_at_3", "recall_at_5", "n_samples", "total_chunks"}
    """
    import random as _random
    chunks = _load_chunks()
    if not chunks:
        return {"error": "知识库为空"}

    n = min(n_samples, len(chunks))
    samples = _random.sample(chunks, n)

    rr_sum = 0.0
    hit_at_1 = hit_at_3 = hit_at_5 = 0

    for chunk in samples:
        query = _make_query_from_chunk(chunk)
        target_id = chunk["text"][:100]
        results = retriever.search(query, top_k=top_k)
        rr = 0.0
        for rank, r in enumerate(results, 1):
            if r["content"][:100] == target_id:
                rr = 1.0 / rank
                if rank == 1: hit_at_1 += 1
                if rank <= 3: hit_at_3 += 1
                if rank <= 5: hit_at_5 += 1
                break
        rr_sum += rr

    return {
        "mrr": round(rr_sum / n, 4),
        "recall_at_1": round(hit_at_1 / n, 4),
        "recall_at_3": round(hit_at_3 / n, 4),
        "recall_at_5": round(hit_at_5 / n, 4),
        "n_samples": n,
        "total_chunks": len(chunks),
    }


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="RAG 检索器")
    parser.add_argument("--query", "-q", type=str, default="",
                        help="搜索关键词（传此参数则退出 4 个默认查询的演示模式）")
    parser.add_argument("--top-k", type=int, default=3,
                        help="返回条数（默认 3）")
    parser.add_argument("--where-category", type=str, default=None,
                        help="按分类过滤，如 'food'/'city'/'driving'（仅 Chroma 后端生效）")
    parser.add_argument("--where-precision", type=str, default=None,
                        help="按精密等级过滤，如 'high'/'medium'（仅 Chroma 后端生效）")
    args = parser.parse_args()

    retriever = RAGRetriever(top_k=args.top_k)
    print(f"\n\U0001f4ca 向量库总片段: {retriever.count()}")

    where = {}
    if args.where_category:
        where["category"] = args.where_category
    if args.where_precision:
        where["precision"] = args.where_precision
    where = where or None

    if args.query:
        queries = [args.query]
    else:
        queries = ["新西兰南岛自驾路线", "皇后镇摄影", "新西兰签证", "Milford Sound cruise"]

    for q in queries:
        print(f"\n{'=' * 60}")
        label = q
        if where:
            label += f" [where={where}]"
        print(f"\U0001f50d 查询: {label}")
        print(f"{'=' * 60}")
        try:
            results = retriever.search(q, where=where)
            for r in results:
                score = r.get("score", "?")
                src = r["metadata"].get("source_name", "?")
                cat = r["metadata"].get("category", "?")
                prc = r["metadata"].get("precision", "?")
                print(f"  [{src}/{cat}/{prc}] ({score}) {r['content'][:100]}...")
        except Exception as e:
            print(f"  ❌ {e}")