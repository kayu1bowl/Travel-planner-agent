"""
Retriever — 多策略 RAG 检索器 (FAISS 版)
替代 ChromaDB 的 VectorStoreIndex，直接使用 FAISS 索引 + 元数据 JSON

策略链：HyDE → Multi-Query → Dense Retrieval → Reranker
"""

import json
import sys
from pathlib import Path
from typing import List, Optional, Dict, Any
sys.path.append(str(Path(__file__).parent.parent.parent))

import numpy as np
import faiss
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.core.postprocessor import SentenceTransformerRerank

from rag_knowledge_base.config import (
    VECTOR_DIR, EMBEDDING_MODEL, RERANKER_MODEL, EMBED_BACKEND,
    DEFAULT_TOP_K, RETRIEVE_MULTIPLIER, RERANK_TOP_K,
    USE_HYDE, NUM_QUERY_VARIANTS,
)

META_FILE = VECTOR_DIR / "metadata.json"
INDEX_FILE = VECTOR_DIR / "faiss.index"


def create_embed_model():
    """创建 embedding 模型实例（与 builder.py 一致）"""
    is_qwen = EMBED_BACKEND.startswith("qwen") or "qwen" in str(EMBEDDING_MODEL).lower()
    if is_qwen:
        model = HuggingFaceEmbedding(
            model_name=EMBEDDING_MODEL,
            trust_remote_code=True,
            query_instruction="为这个句子生成表示以用于检索相关文章：",
        )
        print(f"  📐 Qwen 检索模型已加载 | instruction 前缀已启用")
    else:
        model = HuggingFaceEmbedding(
            model_name=EMBEDDING_MODEL,
            trust_remote_code=True,
        )
        print(f"  📐 BGE 检索模型已加载")
    try:
        dim = model._model.get_sentence_embedding_dimension() if hasattr(model, '_model') else "?"
        print(f"  📏 模型维度: {dim}")
    except:
        pass
    return model


class RAGRetriever:
    def __init__(
        self,
        top_k: int = RERANK_TOP_K,
        use_hyde: bool = USE_HYDE,
        use_multi_query: bool = True,
        use_reranker: bool = True,
        reranker_model: str = RERANKER_MODEL,
    ):
        self.top_k = top_k
        self.use_hyde = use_hyde
        self.use_multi_query = use_multi_query
        self.use_reranker = use_reranker

        self.embed_model = create_embed_model()

        # 加载 FAISS 索引
        if not INDEX_FILE.exists():
            raise FileNotFoundError(f"FAISS 索引不存在: {INDEX_FILE}，请先运行 builder.py")
        self.index = faiss.read_index(str(INDEX_FILE))
        print(f"  📊 FAISS 索引已加载: {self.index.ntotal} 向量, 维度 {self.index.d}")

        # 加载元数据
        if not META_FILE.exists():
            raise FileNotFoundError(f"元数据不存在: {META_FILE}")
        with open(META_FILE, "r", encoding="utf-8") as f:
            self.chunks = json.load(f)
        print(f"  📝 元数据已加载: {len(self.chunks)} 条")

        # 建立 id → chunk 索引加速检索
        self.chunk_map = {c["id"]: c for c in self.chunks}

        if use_reranker:
            self.reranker = SentenceTransformerRerank(
                model=reranker_model,
                top_k=top_k,
            )
        else:
            self.reranker = None

        strategies = []
        if use_hyde: strategies.append("HyDE")
        if use_multi_query: strategies.append("MultiQuery")
        if use_reranker: strategies.append("Reranker")
        print(f"✅ RAG 就绪 | Backend: {EMBED_BACKEND.upper()} | TopK: {top_k} | 策略: {'+'.join(strategies)}")

    def _encode_query(self, query: str) -> np.ndarray:
        """编码查询为向量"""
        emb = self.embed_model.get_query_embedding(query)
        return np.array([emb]).astype(np.float32)

    def _search_faiss(self, query: str, k: int) -> List[Dict]:
        """在 FAISS 索引中搜索"""
        vec = self._encode_query(query)
        distances, indices = self.index.search(vec, k)

        results = []
        for dist, idx in zip(distances[0], indices[0]):
            if idx < 0 or idx >= len(self.chunks):
                continue
            chunk = self.chunks[idx]
            # FAISS IndexFlatIP 返回向量内积（归一化后 = cosine 相似度，0~1）
            score = float(dist)
            results.append({
                "content": chunk["text"],
                "metadata": chunk.get("metadata", {}),
                "score": round(score, 4),
            })
        return results

    def _generate_hyde_doc(self, query: str) -> str:
        return (
            f"As a travel guide for New Zealand, here is detailed information about '{query}': "
            f"This covers key aspects of traveling to and experiencing New Zealand, "
            f"including practical tips, cultural insights, natural attractions, "
            f"and recommended activities related to {query}. "
            f"Visitors will find this useful for planning their trip."
        )

    def _generate_query_variants(self, query: str) -> List[str]:
        variants = [query]

        if all('\u4e00' <= c <= '\u9fff' or c in ' ，。？！' for c in query):
            if "新西兰" in query:
                variants.append(f"New Zealand {query.replace('新西兰', '').strip()}")
            if "自驾" in query or "驾驶" in query:
                variants.append(f"self-driving road trip New Zealand tips rules")
            if "签证" in query:
                variants.append(f"New Zealand visa application requirements")
            if "皇后镇" in query:
                variants.append(f"Queenstown New Zealand travel photography activities")
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
    ) -> List[Dict[str, Any]]:
        k = top_k or self.top_k

        search_queries = [query]
        if self.use_hyde:
            search_queries.append(self._generate_hyde_doc(query))
        if self.use_multi_query:
            for v in self._generate_query_variants(query):
                if v not in search_queries:
                    search_queries.append(v)

        # 多查询搜索
        all_results = []
        seen_texts = set()
        for q in search_queries:
            results = self._search_faiss(q, k * 2)
            for r in results:
                text_key = r["content"][:100]
                if text_key not in seen_texts:
                    seen_texts.add(text_key)
                    all_results.append(r)

        # 按分数排序
        all_results.sort(key=lambda r: r["score"], reverse=True)

        # 使用 reranker
        if self.use_reranker and self.reranker is not None and all_results:
            try:
                from llama_index.core.schema import QueryBundle, NodeWithScore, TextNode
                nodes = []
                for r in all_results:
                    node = TextNode(
                        text=r["content"],
                        metadata=r["metadata"],
                    )
                    nodes.append(NodeWithScore(node=node, score=r["score"]))
                query_bundle = QueryBundle(query_str=query)
                reranked = self.reranker.postprocess_nodes(nodes, query_bundle=query_bundle)
                final = []
                for n in reranked[:k]:
                    final.append({
                        "content": n.text,
                        "metadata": n.metadata,
                        "score": round(float(n.score), 4) if n.score else None,
                    })
                return final
            except Exception:
                pass

        return all_results[:k]

    def count(self) -> int:
        return self.index.ntotal


def rag_search(query: str, top_k: int = 5) -> str:
    """供 OpenClaw 智能体调用"""
    try:
        retriever = RAGRetriever(top_k=top_k)
        results = retriever.search(query)
        if not results:
            return "【知识库检索】未找到相关内容，建议调用联网搜索。"
        output = f"【知识库检索结果】共 {len(results)} 条：\n\n"
        for i, r in enumerate(results, 1):
            m = r["metadata"]
            score = r.get("score", "?")
            output += f"--- 片段 {i} (score={score}) ---\n"
            output += f"📄 {m.get('source_name', '未知')} | 🏷️ {m.get('category', '未分类')}\n"
            output += f"📝 {r['content']}\n\n"
        return output
    except Exception as e:
        return f"【知识库检索】失败: {str(e)}"


if __name__ == "__main__":
    retriever = RAGRetriever(top_k=3)
    print(f"\n📊 向量库总片段: {retriever.count()}")
    for q in ["新西兰南岛自驾路线", "皇后镇摄影", "新西兰签证", "Milford Sound cruise"]:
        print(f"\n{'='*60}")
        print(f"🔍 查询: {q}")
        print(f"{'='*60}")
        for r in retriever.search(q):
            score = r.get("score", "?")
            src = r["metadata"].get("source_name", "?")
            cat = r["metadata"].get("category", "?")
            print(f"  [{src}/{cat}] ({score}) {r['content'][:100]}...")