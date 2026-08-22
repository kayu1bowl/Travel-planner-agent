"""
Builder — RAG 知识库构建器（双后端：FAISS / Chroma）

后端切换（环境变量 VECTOR_BACKEND）:
  faiss   (默认) — FAISS IndexFlatIP + metadata.json
  chroma          — ChromaDB PersistentClient

Chroma 注意事项（历史 Bug 修复）:
  - 不用 delete(where={})  → 改用 delete_collection / 按 id 删除
  - Chroma 1.5+ 不允许空 metadata {}  → 传入 None 代替
  - Chroma 1.5+ 不允许空 where={}    → 删除条件必须带具体字段

流程: 清洗(R1+R2+R3/Qwen3-14B) → 文档总结(Qwen3-14B) → 分片 → 嵌入 → 智能分类(Qwen3-14B) → 向量存储
"""

import json
import os
import sys
import shutil
import uuid
from pathlib import Path
from typing import List, Optional, Dict, Any

# 动态查找项目根（向上遍历直到找到 rag_knowledge_base/ 目录）
def _find_project_root(path: Path) -> Path:
    for p in [path, *path.parents]:
        if (p / "rag_knowledge_base").is_dir():
            return p
    return path.parent  # fallback

_project_root = str(_find_project_root(Path(__file__).resolve()))
if _project_root not in sys.path:
    sys.path.insert(0, _project_root)

import numpy as np

# ── 从 config.py 加载配置（模块级常量，只加载一次） ──
from rag_knowledge_base.config import (
    VECTOR_DIR, RAW_DIR, CLEANED_DIR, CHROMA_DIR,
    EMBEDDING_MODEL, EMBED_BACKEND,
    CHUNK_SIZE, CHUNK_OVERLAP,
    VECTOR_BACKEND as _CFG_VECTOR_BACKEND,
    COLLECTION_NAME,
)

# 运行时配置（每次从 os.environ 重读，支持 CLI --no-qwen3 等临时覆盖）
import rag_knowledge_base.config as _cfg_module

def _cfg_str(key: str, default: str) -> str:
    return os.environ.get(key, str(getattr(_cfg_module, key, default)))

def _cleaner_backend():
    return _cfg_str("CLEANER_BACKEND", "qwen3")

def _cleaner_threshold():
    return float(_cfg_str("CLEANER_THRESHOLD", "0.5"))

def _enable_auto_classify():
    return _cfg_str("ENABLE_AUTO_CLASSIFY", "true").lower() == "true"

def _enable_advanced_summary():
    return _cfg_str("ENABLE_ADVANCED_SUMMARY", "true").lower() == "true"

def _vector_backend():
    return _cfg_str("VECTOR_BACKEND", _CFG_VECTOR_BACKEND)


# ===================================================================
# Embedding 模型
# ===================================================================

def create_embed_model():
    """创建 embedding 模型实例（单例缓存，本地优先）"""
    if hasattr(create_embed_model, "_cache"):
        return create_embed_model._cache

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
            dim_fn = getattr(model._model, 'get_embedding_dimension', None) or \
                     getattr(model._model, 'get_sentence_embedding_dimension', None)
            dim = dim_fn() if dim_fn else "?"
        else:
            dim = "?"
        print(f"  📏 模型维度: {dim}")
    except:
        pass
    create_embed_model._cache = model
    return model









# ===================================================================
# Chroma EmbeddingFunction 包装
# ===================================================================

class _ChromaEmbeddingWrapper:
    def __init__(self, embed_model):
        self.embed_model = embed_model

    def __call__(self, input):
        return [self.embed_model.get_text_embedding(t) for t in input]


# ===================================================================
# 元数据存储（FAISS 用）
# ===================================================================

META_FILE = VECTOR_DIR / "metadata.json"
INDEX_FILE = VECTOR_DIR / "faiss.index"


def _save_metadata(chunks: List[Dict[str, Any]]):
    VECTOR_DIR.mkdir(parents=True, exist_ok=True)
    with open(META_FILE, "w", encoding="utf-8") as f:
        json.dump(chunks, f, ensure_ascii=False, indent=2)
    print(f"  \U0001f4dd 元数据已保存: {META_FILE} ({len(chunks)} 条)")


def _load_metadata() -> List[Dict[str, Any]]:
    if not META_FILE.exists():
        return []
    with open(META_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def _print_category_distribution(chunks):
    from collections import Counter
    cats = Counter(c.get("metadata", {}).get("category", "?") for c in chunks)
    if cats:
        print(f"\n  \U0001f3f7\ufe0f  分类分布:")
        for cat, cnt in sorted(cats.items(), key=lambda x: -x[1]):
            pct = cnt / len(chunks) * 100
            bar = "\u2588" * int(pct / 5) + "\u2591" * (20 - int(pct / 5))
            print(f"    {cat:<28s} {cnt:>4d}  ({pct:5.1f}%)  {bar}")


# ===================================================================
# 智能分类
# ===================================================================

def _run_classify(all_chunks, embed_model):
    from rag_knowledge_base.classifier import classify_chunks, discover_categories
    categories = discover_categories(all_chunks)
    return classify_chunks(all_chunks, categories=categories, embed_model=embed_model, max_workers=4)


# ===================================================================
# 向量库构建器
# ===================================================================

class KnowledgeBaseBuilder:
    def __init__(self, backend=None):
        self.embed_model = create_embed_model()
        self.embed_dim = None
        self.backend = backend if backend is not None else _vector_backend()
        try:
            test_emb = self.embed_model.get_text_embedding("test")
            self.embed_dim = len(test_emb)
            print(f"  \U0001f4cf 实际嵌入维度: {self.embed_dim}")
        except Exception as e:
            print(f"  \u26a0\ufe0f 无法获取嵌入维度: {e}")
        print(f"  \U0001f5c4\ufe0f  后端: {self.backend.upper()}")

    # ── 重置 ──
    def _reset_chroma(self):
        import chromadb
        client = chromadb.PersistentClient(path=str(CHROMA_DIR))
        try:
            client.delete_collection(COLLECTION_NAME)
            print(f"  \U0001f9f9 已删除 Chroma 集合: {COLLECTION_NAME}")
        except Exception:
            print(f"  \U0001f9f9 Chroma 集合不存在，跳过")

    def _reset_faiss(self):
        if VECTOR_DIR.exists():
            shutil.rmtree(str(VECTOR_DIR))
            print(f"  \U0001f9f9 已清除 FAISS 目录: {VECTOR_DIR}")
        VECTOR_DIR.mkdir(parents=True, exist_ok=True)

    def reset(self):
        if self.backend == "chroma":
            self._reset_chroma()
        else:
            self._reset_faiss()

    # ── 清洗 ──
    def _clean_content(self, text: str) -> str:
        from rag_knowledge_base.embedding.cleaner import clean_text
        return clean_text(text, backend=_cleaner_backend(), threshold=_cleaner_threshold())

    # ── 来源名提取 ──
    @staticmethod
    def _extract_source_name(filename: str) -> str:
        _KNOWN_SOURCES = {
            "wikipedia", "wikivoyage", "doc", "nzta", "aa",
            "teara", "police", "newzealand", "opentripmap",
        }
        name_lower = filename.lower()
        for kw in _KNOWN_SOURCES:
            if kw in name_lower:
                return kw
        parts = filename.rsplit(".", 1)[0].split("_")
        for p in parts:
            if not p.isdigit():
                return p
        return "unknown"

    # ── 统一：分类 → 存储 ──
    def _finalize(self, all_chunks, all_vectors, label=""):
        if _enable_auto_classify() and all_chunks:
            print(f"\n  \U0001f3f7\ufe0f  智能分类 {len(all_chunks)} 个片段...")
            all_chunks = _run_classify(all_chunks, self.embed_model)
        else:
            for c in all_chunks:
                c.setdefault("metadata", {})["category"] = "general"

        # ── 精密等级评分（扩展 metadata.precision，不干涉已有字段） ──
        if _cfg_str("ENABLE_PRECISION", "true").lower() == "true":
            from rag_knowledge_base.precision import grade_batch, print_precision_distribution
            print(f"\n  \U0001f3af 精密等级评分 {len(all_chunks)} 个片段...")
            all_chunks = grade_batch(all_chunks)
            print_precision_distribution(all_chunks)
        else:
            print(f"  \U0001f3af 精密等级评分: 已跳过 (ENABLE_PRECISION=false)")

        print(f"  \U0001f4e1 嵌入/存储 {len(all_chunks)} 个片段 (backend={self.backend.upper()})...")
        if self.backend == "chroma":
            self._store_chroma(all_chunks)
        else:
            self._store_faiss(all_chunks, all_vectors)

        print(f"\n\U0001f389 {label}构建完成！总片段: {len(all_chunks)}")
        _print_category_distribution(all_chunks)
        if _cfg_str("ENABLE_PRECISION", "true").lower() == "true":
            print_precision_distribution(all_chunks)

    # ── Chroma 存储 ──
    def _store_chroma(self, all_chunks):
        import chromadb
        ef = _ChromaEmbeddingWrapper(self.embed_model)
        client = chromadb.PersistentClient(path=str(CHROMA_DIR))
        self._reset_chroma()
        collection = client.create_collection(
            COLLECTION_NAME,
            embedding_function=ef,
            metadata={"hnsw:space": "cosine"},
        )
        batch_size = 100
        for i in range(0, len(all_chunks), batch_size):
            batch = all_chunks[i:i + batch_size]
            ids = [c["id"] for c in batch]
            texts = [c["text"] for c in batch]
            metas = [c.get("metadata", {}) or None for c in batch]
            collection.add(ids=ids, documents=texts, metadatas=metas)
            print(f"  \u2713 Chroma 写入: {i + len(batch)}/{len(all_chunks)}")
        print(f"  \u2705 Chroma 集合 [{COLLECTION_NAME}] 共 {collection.count()} 条")
        # 同时写一份 metadata.json（供增量去重 + 检索共用）
        _save_metadata(all_chunks)

    # ── FAISS 存储 ──
    def _store_faiss(self, all_chunks, all_vectors):
        import faiss
        _save_metadata(all_chunks)
        if not all_vectors:
            print("  \u26a0\ufe0f  空向量列表")
            return
        vectors = np.array(all_vectors).astype(np.float32)
        dim = vectors.shape[1]
        index = faiss.IndexFlatIP(dim)
        index.add(vectors)
        VECTOR_DIR.mkdir(parents=True, exist_ok=True)
        faiss.write_index(index, str(INDEX_FILE))
        print(f"  \u2705 FAISS 索引: {INDEX_FILE} ({index.ntotal} 向量, {dim} 维)")

    # ── 本地构建（raw 目录） ──
    def build_from_local(self, raw_dir=None, incremental=False):
        from llama_index.core import Document as LDocument
        from llama_index.core.node_parser import SentenceSplitter

        if raw_dir is None:
            raw_dir = RAW_DIR

        # 清洗 raw → cleaned
        from rag_knowledge_base.embedding.cleaner import batch_clean
        batch_clean(
            input_dir=raw_dir, output_dir=CLEANED_DIR,
            backend=_cleaner_backend(),
            with_summary=False,
            threshold=_cleaner_threshold(),
        )

        if not incremental:
            self.reset()

        cleaned_files = sorted(CLEANED_DIR.glob("*.txt"))
        if not cleaned_files:
            print("  \u26a0\ufe0f  无 cleaned 文件")
            return

        splitter = SentenceSplitter(
            chunk_size=CHUNK_SIZE, chunk_overlap=CHUNK_OVERLAP,
            separator="\n\n", paragraph_separator="\n\n",
            secondary_chunking_regex="[^,.;。！？\n]+[,.;。！？]?\n*",
        )

        existing_by_text = set()
        if incremental and META_FILE.exists():
            for c in _load_metadata():
                existing_by_text.add(c["text"][:100])

        all_chunks = _load_metadata() if incremental else []
        all_vectors = []

        for f in cleaned_files:
            try:
                text = f.read_text(encoding="utf-8").strip()
            except Exception:
                continue
            if not text:
                continue

            source_name = self._extract_source_name(f.name)
            meta = {
                "source": f.name,
                "source_name": source_name,
                "category": "general",
                "title": f.name,
                "doc_type": "local",
            }
            doc = LDocument(text=text, metadata=meta)
            nodes = splitter.get_nodes_from_documents([doc])

            for node in nodes:
                node_text = node.get_content()
                if len(node_text.strip()) < 20:
                    continue
                if incremental and node_text[:100] in existing_by_text:
                    continue
                if self.backend == "faiss":
                    all_vectors.append(self.embed_model.get_text_embedding(node_text))
                all_chunks.append({
                    "id": str(uuid.uuid4()),
                    "text": node_text,
                    "metadata": dict(meta),
                })

            print(f"  \U0001f4c4 {f.name[:40]}... {len(nodes)} 片段 (累计{len(all_chunks)})")

        if not all_chunks:
            print("  \u26a0\ufe0f  没有新片段")
            return

        self._finalize(all_chunks, all_vectors, label="本地")

    # ── 网络构建 ──
    def _build_from_docs(self, documents, incremental=False):
        from llama_index.core import Document as LDocument
        from llama_index.core.node_parser import SentenceSplitter

        if not incremental:
            self.reset()

        print(f"\U0001f9f9 清洗 {len(documents)} 个文档 (backend={_cleaner_backend()})...")

        splitter = SentenceSplitter(
            chunk_size=CHUNK_SIZE, chunk_overlap=CHUNK_OVERLAP,
            separator="\n\n", paragraph_separator="\n\n",
            secondary_chunking_regex="[^,.;。！？\n]+[,.;。！？]?\n*",
        )

        all_chunks = _load_metadata() if incremental else []
        all_vectors = []
        existing_by_text = set()
        if incremental:
            for c in all_chunks:
                existing_by_text.add(c["text"][:100])

        for idx, doc_dict in enumerate(documents):
            raw_text = doc_dict.get("content", "")

            cleaned = self._clean_content(raw_text)
            if len(cleaned.strip()) < 50:
                continue
            meta = {
                "source": doc_dict.get("url", ""),
                "source_name": doc_dict.get("source_name", "unknown"),
                "category": "general",
                "title": doc_dict.get("title", ""),
                "doc_type": "web",
            }
            ldoc = LDocument(text=cleaned, metadata=meta)
            nodes = splitter.get_nodes_from_documents([ldoc])
            n_total = len(documents)
            pct = (idx + 1) / n_total * 100
            print(f"  \U0001f310 文档 {idx+1}/{n_total} ({pct:.0f}%) | {doc_dict.get('title', '?')[:30]} | {len(nodes)} 片段 | 累计 {len(all_chunks)}", flush=True)
            for node in nodes:
                node_text = node.get_content()
                if len(node_text.strip()) < 20:
                    continue
                if incremental and node_text[:100] in existing_by_text:
                    continue
                if self.backend == "faiss":
                    all_vectors.append(self.embed_model.get_text_embedding(node_text))
                all_chunks.append({
                    "id": str(uuid.uuid4()),
                    "text": node_text,
                    "metadata": dict(meta),
                })

        if not all_chunks:
            print("  \u26a0\ufe0f  没有新片段")
            return
        self._finalize(all_chunks, all_vectors, label="网络")

    def build_from_web(self, web_documents, incremental=False):
        self._build_from_docs(web_documents, incremental=incremental)

    def get_stats(self):
        chunks = _load_metadata()
        has_index = INDEX_FILE.exists()
        has_chroma = CHROMA_DIR.exists() and (CHROMA_DIR / "chroma.sqlite3").exists()
        if not chunks:
            total = 0
            if has_chroma:
                try:
                    import chromadb
                    client = chromadb.PersistentClient(path=str(CHROMA_DIR))
                    for c in client.list_collections():
                        if c.name == COLLECTION_NAME:
                            total = c.count()
                except Exception:
                    pass
            return {"total_chunks": total, "sources": [], "categories": [],
                    "index_exists": has_index, "chroma_exists": has_chroma}
        sources = list(set(c["metadata"].get("source_name", "?") for c in chunks))
        categories = list(set(c["metadata"].get("category", "?") for c in chunks))
        return {
            "total_chunks": len(chunks),
            "sources": sources,
            "categories": categories,
            "index_exists": has_index,
            "chroma_exists": has_chroma,
        }


# ===================================================================
# 便捷入口
# ===================================================================

async def build_kb_from_network(incremental=False, backend=None):
    from rag_knowledge_base.crawler.crawl4ai_fetcher import fetch_all_sources
    _bn = backend or _vector_backend()
    print(f"\U0001f310 网络抓取 \u2192 清洗({_cleaner_backend()}) \u2192 分片 \u2192 {EMBED_BACKEND.upper()}嵌入 \u2192 {_bn.upper()}")
    docs = await fetch_all_sources()
    if not docs:
        print("\u274c 未抓取到内容")
        return
    KnowledgeBaseBuilder(backend=backend)._build_from_docs(docs, incremental=incremental)


def build_kb_from_local(raw_dir=None, incremental=False, backend=None):
    KnowledgeBaseBuilder(backend=backend).build_from_local(raw_dir, incremental=incremental)


def kb_stats(backend=None):
    builder = KnowledgeBaseBuilder(backend=backend)
    stats = builder.get_stats()
    print(f"\n\U0001f4ca 总片段: {stats['total_chunks']}")
    print(f"来源: {', '.join(stats['sources'])}")
    print(f"分类: {', '.join(stats['categories'])}")
    if stats.get("index_exists"):
        print("\u2705 FAISS 索引存在")
    if stats.get("chroma_exists"):
        print("\u2705 Chroma 集合存在")
    if not stats.get("index_exists") and not stats.get("chroma_exists"):
        print("\u26a0\ufe0f  向量库为空，请先构建")


# ===================================================================
# CLI 入口
# ===================================================================

if __name__ == "__main__":
    import asyncio
    import argparse

    parser = argparse.ArgumentParser(description="RAG 知识库构建器（双后端）")
    parser.add_argument("--mode", choices=["local", "network", "stats"], default="local",
                        help="构建模式: local=本地raw文件 | network=网络抓取 | stats=查看统计")
    parser.add_argument("--incremental", action="store_true",
                        help="增量模式，不清空已有数据")
    parser.add_argument("--raw-dir", default=None,
                        help="raw 数据目录（仅 local 模式，默认 config.RAW_DIR）")
    parser.add_argument("--backend", choices=["chroma", "faiss"], default=None,
                        help="向量后端（默认 config.VECTOR_BACKEND）")
    parser.add_argument("--no-qwen3", action="store_true",
                        help="跳过 Qwen3-14B，使用纯规则清洗（快速测试用）")
    parser.add_argument("--no-classify", action="store_true",
                        help="跳过智能分类，全部归为 general")
    parser.add_argument("--no-summary", action="store_true",
                        help="跳过文档级智能总结")
    args = parser.parse_args()

    # 通过环境变量将 CLI 参数传递给下层调用（runtime 函数会重新读取 os.environ）
    if args.no_qwen3:
        os.environ["CLEANER_BACKEND"] = "rule"
    if args.no_summary:
        os.environ["ENABLE_ADVANCED_SUMMARY"] = "false"
    if args.no_classify:
        os.environ["ENABLE_AUTO_CLASSIFY"] = "false"

    _be = args.backend or _vector_backend()

    print("\n" + "=" * 60)
    print("  \U0001f5fa\ufe0f  NZ Travel RAG 知识库构建器")
    print(f"  模式: {args.mode} | 后端: {_be.upper()}")
    print(f"  清洗: {_cleaner_backend()}")
    print(f"  文档总结: {_enable_advanced_summary()}")
    print(f"  智能分类: {_enable_auto_classify()}")
    print("=" * 60 + "\n")

    if args.mode == "network":
        asyncio.run(build_kb_from_network(incremental=args.incremental, backend=_be))
    elif args.mode == "local":
        build_kb_from_local(raw_dir=args.raw_dir, incremental=args.incremental, backend=_be)
    elif args.mode == "stats":
        kb_stats(backend=_be)