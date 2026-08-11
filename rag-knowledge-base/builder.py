"""
Builder — RAG 知识库构建器（双后端：FAISS / Chroma）

后端切换（环境变量 VECTOR_BACKEND）:
  faiss   (默认) — FAISS IndexFlatIP + metadata.json
  chroma          — ChromaDB PersistentClient

Chroma 注意事项（历史 Bug 修复）:
  - 不用 delete(where={})  → 改用 delete_collection / 按 id 删除
  - Chroma 1.5+ 不允许空 metadata {}  → 传入 None 代替
  - Chroma 1.5+ 不允许空 where={}    → 删除条件必须带具体字段

流程: 清洗 → 分片 → 嵌入 → 智能分类 → 向量存储
"""

import gc
import json
import sys
import shutil
import time
import uuid
from pathlib import Path
from typing import List, Optional, Dict, Any
# 确保项目根在 sys.path 中，使 from rag_knowledge_base.xxx 正常工作
# builder.py 在 rag_knowledge_base/ 里，parent=travel-planner/
_project_root = str(Path(__file__).parent.parent)
if _project_root not in sys.path:
    sys.path.insert(0, _project_root)

import numpy as np

# 直接加载 config，不经过 __init__.py（避免触发 faiss/llama_index 重依赖）
_config_path = Path(_project_root) / "rag_knowledge_base" / "config.py"
if _config_path.exists():
    import importlib.util
    _spec = importlib.util.spec_from_file_location("rag_config", _config_path)
    _cfg = importlib.util.module_from_spec(_spec)
    _spec.loader.exec_module(_cfg)
    VECTOR_DIR = _cfg.VECTOR_DIR
    RAW_DIR = _cfg.RAW_DIR
    CLEANED_DIR = _cfg.CLEANED_DIR
    EMBEDDING_MODEL = _cfg.EMBEDDING_MODEL
    EMBED_BACKEND = _cfg.EMBED_BACKEND
    CHUNK_SIZE = _cfg.CHUNK_SIZE
    CHUNK_OVERLAP = _cfg.CHUNK_OVERLAP
    CLEANER_BACKEND = _cfg.CLEANER_BACKEND
    CLEANER_THRESHOLD = _cfg.CLEANER_THRESHOLD
    VECTOR_BACKEND = _cfg.VECTOR_BACKEND
    CHROMA_DIR = _cfg.CHROMA_DIR
    COLLECTION_NAME = _cfg.COLLECTION_NAME
    ENABLE_AUTO_CLASSIFY = _cfg.ENABLE_AUTO_CLASSIFY
    ENABLE_ADVANCED_SUMMARY = _cfg.ENABLE_ADVANCED_SUMMARY
else:
    from rag_knowledge_base.config import (
        VECTOR_DIR, RAW_DIR, CLEANED_DIR, CHROMA_DIR,
        EMBEDDING_MODEL, EMBED_BACKEND,
        CHUNK_SIZE, CHUNK_OVERLAP,
        CLEANER_BACKEND, CLEANER_THRESHOLD,
        VECTOR_BACKEND, COLLECTION_NAME, ENABLE_AUTO_CLASSIFY,
    )


# ===================================================================
# Embedding 模型
# ===================================================================

def create_embed_model():
    """创建 embedding 模型实例（单例缓存）"""
    if hasattr(create_embed_model, "_cache"):
        return create_embed_model._cache

    from llama_index.embeddings.huggingface import HuggingFaceEmbedding
    is_qwen = EMBED_BACKEND.startswith("qwen") or "qwen" in str(EMBEDDING_MODEL).lower()
    if is_qwen:
        model = HuggingFaceEmbedding(
            model_name=EMBEDDING_MODEL,
            trust_remote_code=True,
            query_instruction="为这个句子生成表示以用于检索相关文章：",
        )
        print(f"  📐 Qwen 模型已加载 | instruction 前缀已启用")
    else:
        model = HuggingFaceEmbedding(
            model_name=EMBEDDING_MODEL,
            trust_remote_code=True,
        )
        print(f"  📐 BGE 模型已加载")
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
# Chroma EmbeddingFunction 包装（适配 chromadb）
# ===================================================================

class _ChromaEmbeddingWrapper:
    """将 HuggingFaceEmbedding 包装为 ChromaDB 的 EmbeddingFunction"""
    def __init__(self, embed_model):
        self.embed_model = embed_model

    def __call__(self, input):
        # Chroma 传进来是 List[str]
        return [self.embed_model.get_text_embedding(t) for t in input]


# ===================================================================
# 元数据存储（FAISS 用）
# ===================================================================

META_FILE = VECTOR_DIR / "metadata.json"
INDEX_FILE = VECTOR_DIR / "faiss.index"


def _save_metadata(chunks: List[Dict[str, Any]]):
    """保存片段元数据"""
    VECTOR_DIR.mkdir(parents=True, exist_ok=True)
    with open(META_FILE, "w", encoding="utf-8") as f:
        json.dump(chunks, f, ensure_ascii=False, indent=2)
    print(f"  📝 元数据已保存: {META_FILE} ({len(chunks)} 条)")


def _load_metadata() -> List[Dict[str, Any]]:
    if not META_FILE.exists():
        return []
    with open(META_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def _print_category_distribution(chunks):
    from collections import Counter
    cats = Counter(c.get("metadata", {}).get("category", "?") for c in chunks)
    if cats:
        print(f"\n  🏷️  分类分布:")
        for cat, cnt in sorted(cats.items(), key=lambda x: -x[1]):
            pct = cnt / len(chunks) * 100
            bar = "█" * int(pct / 5) + "░" * (20 - int(pct / 5))
            print(f"    {cat:<28s} {cnt:>4d}  ({pct:5.1f}%)  {bar}")


# ===================================================================
# 分类入口
# ===================================================================

def _run_classify(all_chunks, embed_model):
    """智能分类：发现 → 分类"""
    # 项目根已在 sys.path 中，from rag_knowledge_base.classifier 一定可用
    from rag_knowledge_base.classifier import classify_chunks, discover_categories
    categories = discover_categories(all_chunks)
    return classify_chunks(
        all_chunks, categories=categories,
        embed_model=embed_model, max_workers=4,
    )


# ===================================================================
# 向量库构建器
# ===================================================================

class KnowledgeBaseBuilder:
    def __init__(self, backend=None):
        self.embed_model = create_embed_model()
        self.embed_dim = None
        # 优先使用传入参数，其次环境变量
        if backend is not None:
            self.backend = backend
        else:
            from rag_knowledge_base.config import VECTOR_BACKEND as _vb
            self.backend = _vb
        try:
            test_emb = self.embed_model.get_text_embedding("test")
            self.embed_dim = len(test_emb)
            print(f"  📏 实际嵌入维度: {self.embed_dim}")
        except Exception as e:
            print(f"  ⚠️ 无法获取嵌入维度: {e}")

        print(f"  🗄️  后端: {self.backend.upper()}")

    # ── 重置 ──────────────────────────────────────────────────────
    def _reset_chroma(self):
        """清空 ChromaDB 集合（不用 delete(where={})）"""
        import chromadb
        client = chromadb.PersistentClient(path=str(CHROMA_DIR))
        try:
            client.delete_collection(COLLECTION_NAME)
            print(f"  🧹 已删除 Chroma 集合: {COLLECTION_NAME}")
        except Exception:
            print(f"  🧹 Chroma 集合不存在，跳过")

    def _reset_faiss(self):
        """清空 FAISS 向量库"""
        if VECTOR_DIR.exists():
            shutil.rmtree(str(VECTOR_DIR))
            print(f"  🧹 已清除 FAISS 目录: {VECTOR_DIR}")
        VECTOR_DIR.mkdir(parents=True, exist_ok=True)

    def reset(self):
        """根据后端重置向量库"""
        if self.backend == "chroma":
            self._reset_chroma()
        else:
            self._reset_faiss()

    # ── 清洗 ──────────────────────────────────────────────────────
    def _clean_content(self, text: str, label: str = "") -> str:
        """清洗文本：根据配置选择初版(1.5B)或高级(14B)"""
        if ENABLE_ADVANCED_SUMMARY:
            from rag_knowledge_base.embedding.advanced_cleaner import advanced_clean_text
            return advanced_clean_text(text, label=label)
        from rag_knowledge_base.embedding.cleaner import clean_text
        return clean_text(text, use_qwen=(CLEANER_BACKEND == "qwen"), threshold=CLEANER_THRESHOLD)

    # ── 来源名提取 ────────────────────────────────────────────────
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

    # ── 统一：分类 → 存储 ────────────────────────────────────────
    def _finalize(self, all_chunks, all_vectors, label=""):
        """分类 → 保存 → 建索引（根据后端分发）"""
        # 1) 智能分类
        if ENABLE_AUTO_CLASSIFY and all_chunks:
            print(f"\n  🏷️  智能分类 {len(all_chunks)} 个片段...")
            all_chunks = _run_classify(all_chunks, self.embed_model)
        else:
            for c in all_chunks:
                c.setdefault("metadata", {})["category"] = "general"

        # 2) 按后端存储
        if self.backend == "chroma":
            self._store_chroma(all_chunks)
        else:
            self._store_faiss(all_chunks, all_vectors)

        print(f"\n🎉 {label}构建完成！总片段: {len(all_chunks)}")
        _print_category_distribution(all_chunks)

    # ── Chroma 存储 ──────────────────────────────────────────────
    def _store_chroma(self, all_chunks):
        """存入 ChromaDB"""
        import chromadb

        ef = _ChromaEmbeddingWrapper(self.embed_model)
        client = chromadb.PersistentClient(path=str(CHROMA_DIR))

        self._reset_chroma()
        collection = client.create_collection(COLLECTION_NAME, embedding_function=ef)

        # Chroma 1.5+ 规则：空 metadata {} 必须换成 None
        batch_size = 100
        for i in range(0, len(all_chunks), batch_size):
            batch = all_chunks[i:i + batch_size]
            ids = [c["id"] for c in batch]
            texts = [c["text"] for c in batch]
            metas = []
            for c in batch:
                m = c.get("metadata", {})
                metas.append(m if m else None)

            collection.add(
                ids=ids,
                documents=texts,
                metadatas=metas,
            )
            print(f"  ✓ Chroma 写入: {i + len(batch)}/{len(all_chunks)}")

        print(f"  ✅ Chroma 集合 [{COLLECTION_NAME}] 共 {collection.count()} 条")

    # ── FAISS 存储 ──────────────────────────────────────────────
    def _store_faiss(self, all_chunks, all_vectors):
        """存入 FAISS 索引"""
        import faiss
        _save_metadata(all_chunks)

        if not all_vectors:
            print("  ⚠️  空向量列表")
            return

        vectors = np.array(all_vectors).astype(np.float32)
        dim = vectors.shape[1]
        index = faiss.IndexFlatIP(dim)
        index.add(vectors)
        VECTOR_DIR.mkdir(parents=True, exist_ok=True)
        faiss.write_index(index, str(INDEX_FILE))
        print(f"  ✅ FAISS 索引: {INDEX_FILE} ({index.ntotal} 向量, {dim} 维)")

    # ── 本地构建（raw 目录） ─────────────────────────────────────
    def build_from_local(self, raw_dir=None, incremental=False):
        from llama_index.core import Document as LDocument
        from llama_index.core.node_parser import SentenceSplitter

        if raw_dir is None:
            raw_dir = RAW_DIR

        # 清洗 raw → cleaned
        if ENABLE_ADVANCED_SUMMARY:
            from rag_knowledge_base.embedding.advanced_cleaner import advanced_batch_clean
            advanced_batch_clean(input_dir=raw_dir, output_dir=CLEANED_DIR, with_summary=True)
        else:
            from rag_knowledge_base.embedding.cleaner import batch_clean
            batch_clean(input_dir=raw_dir, output_dir=CLEANED_DIR,
                        use_qwen=(CLEANER_BACKEND == "qwen"),
                        threshold=CLEANER_THRESHOLD)

        if not incremental:
            self.reset()

        cleaned_files = sorted(CLEANED_DIR.glob("*.txt"))
        if not cleaned_files:
            print("  ⚠️  无 cleaned 文件")
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
        all_vectors = []  # FAISS 用

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

                # FAISS 模式需要向量，Chroma 模式下可跳过以加速
                if self.backend == "faiss":
                    emb = self.embed_model.get_text_embedding(node_text)
                    all_vectors.append(emb)

                all_chunks.append({
                    "id": str(uuid.uuid4()),
                    "text": node_text,
                    "metadata": dict(meta),
                })

            print(f"  📄 {f.name[:40]}... {len(nodes)} 片段")

        if not all_chunks:
            print("  ⚠️  没有新片段")
            return

        self._finalize(all_chunks, all_vectors, label="本地")

    # ── 网络构建 ─────────────────────────────────────────────────
    def _build_from_docs(self, documents, incremental=False):
        from llama_index.core import Document as LDocument
        from llama_index.core.node_parser import SentenceSplitter

        if not incremental:
            self.reset()

        print(f"🧹 清洗 {len(documents)} 个文档 (backend={CLEANER_BACKEND})...")

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

        for doc_dict in documents:
            raw_text = doc_dict.get("content", "")
            cleaned = self._clean_content(raw_text, f"{doc_dict.get('source_name','?')}")
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
            print("  ⚠️  没有新片段")
            return

        self._finalize(all_chunks, all_vectors, label="网络")

    def build_from_web(self, web_documents, incremental=False):
        self._build_from_docs(web_documents, incremental=incremental)

    def get_stats(self):
        chunks = _load_metadata()
        if not chunks:
            return {"total_chunks": 0, "sources": [], "categories": []}
        sources = list(set(c["metadata"].get("source_name", "?") for c in chunks))
        categories = list(set(c["metadata"].get("category", "?") for c in chunks))
        return {
            "total_chunks": len(chunks),
            "sources": sources,
            "categories": categories,
            "index_exists": INDEX_FILE.exists(),
        }


# ===================================================================
# 便捷入口
# ===================================================================

async def build_kb_from_network(incremental=False, backend=None):
    from rag_knowledge_base.crawler.crawl4ai_fetcher import fetch_all_sources
    print("=" * 60)
    _bn = backend or VECTOR_BACKEND
    print(f"🌐 网络抓取 → 清洗({CLEANER_BACKEND}) → 分片 → {EMBED_BACKEND.upper()}嵌入 → {_bn.upper()}")
    print("=" * 60)
    docs = await fetch_all_sources()
    if not docs:
        print("❌ 未抓取到内容")
        return
    builder = KnowledgeBaseBuilder(backend=backend)
    builder._build_from_docs(docs, incremental=incremental)


def build_kb_from_local(raw_dir=None, incremental=False, backend=None):
    KnowledgeBaseBuilder(backend=backend).build_from_local(raw_dir, incremental=incremental)


def kb_stats(backend=None):
    builder = KnowledgeBaseBuilder(backend=backend)
    stats = builder.get_stats()
    print(f"\n📊 总片段: {stats['total_chunks']}")
    print(f"来源: {', '.join(stats['sources'])}")
    print(f"分类: {', '.join(stats['categories'])}")
    if stats.get("index_exists"):
        print(f"✅ FAISS 索引存在")
    else:
        print(f"⚠️  FAISS 索引不存在（使用 Chroma 时为正常）")


if __name__ == "__main__":
    import asyncio
    import argparse

    parser = argparse.ArgumentParser(description="RAG 知识库构建器（双后端）")
    parser.add_argument("--mode", choices=["local", "network", "stats"], default="local")
    parser.add_argument("--incremental", action="store_true")
    parser.add_argument("--raw-dir", default=None)
    parser.add_argument("--backend", choices=["chroma", "faiss"], default=None,
                        help=f"覆盖 VECTOR_BACKEND（默认: {VECTOR_BACKEND}）")
    args = parser.parse_args()

    if args.backend:
        _be = args.backend
    else:
        # 复用模块顶部已加载的 _cfg 对象，不触发 __init__
        _be = _cfg.VECTOR_BACKEND

    if args.mode == "network":
        asyncio.run(build_kb_from_network(incremental=args.incremental, backend=_be))
    elif args.mode == "local":
        build_kb_from_local(raw_dir=args.raw_dir, incremental=args.incremental, backend=_be)
    elif args.mode == "stats":
        kb_stats(backend=_be)