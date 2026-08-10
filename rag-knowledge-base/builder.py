"""
Builder — RAG 知识库构建器 (FAISS 版)
使用 FAISS 替代 ChromaDB，避免 ChromaDB 1.5.x Rust HNSW 索引损坏 bug。

流程: 清洗 → 分片 → 嵌入 → FAISS 索引 → 元数据持久化
"""

import gc
import json
import sys
import shutil
import time
import uuid
import pickle
from pathlib import Path
from typing import List, Optional, Dict, Any
sys.path.append(str(Path(__file__).parent.parent))

import numpy as np
from llama_index.core.node_parser import SentenceSplitter
from llama_index.embeddings.huggingface import HuggingFaceEmbedding

from rag_knowledge_base.config import (
    VECTOR_DIR, RAW_DIR, CLEANED_DIR, EMBEDDING_MODEL, EMBED_BACKEND,
    CHUNK_SIZE, CHUNK_OVERLAP,
    CLEANER_BACKEND, CLEANER_THRESHOLD,
)


def create_embed_model():
    """创建 embedding 模型实例"""
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
            dim_fn = getattr(model._model, 'get_embedding_dimension', None)
            if dim_fn is None:
                dim_fn = getattr(model._model, 'get_sentence_embedding_dimension', None)
            dim = dim_fn() if dim_fn else "?"
        else:
            dim = "?"
        print(f"  📏 模型维度: {dim}")
    except:
        pass
    return model


# ===================================================================
# 元数据存储
# ===================================================================

META_FILE = VECTOR_DIR / "metadata.json"
INDEX_FILE = VECTOR_DIR / "faiss.index"


def _save_metadata(chunks: List[Dict[str, Any]]):
    """保存片段元数据（id, text, metadata）"""
    VECTOR_DIR.mkdir(parents=True, exist_ok=True)
    with open(META_FILE, "w", encoding="utf-8") as f:
        json.dump(chunks, f, ensure_ascii=False, indent=2)
    print(f"  📝 元数据已保存: {META_FILE} ({len(chunks)} 条)")


def _load_metadata() -> List[Dict[str, Any]]:
    """加载片段元数据"""
    if not META_FILE.exists():
        return []
    with open(META_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


# ===================================================================
# 向量库构建
# ===================================================================

class KnowledgeBaseBuilder:
    def __init__(self):
        self.embed_model = create_embed_model()
        self.embed_dim = None
        # 获取维度
        try:
            test_emb = self.embed_model.get_text_embedding("test")
            self.embed_dim = len(test_emb)
            print(f"  📏 实际嵌入维度: {self.embed_dim}")
        except Exception as e:
            print(f"  ⚠️ 无法获取嵌入维度: {e}")

    def _reset_index(self):
        """清除已有的向量库"""
        if VECTOR_DIR.exists():
            shutil.rmtree(str(VECTOR_DIR))
            print(f"  🧹 已清除向量库目录: {VECTOR_DIR}")
        VECTOR_DIR.mkdir(parents=True, exist_ok=True)

    def _clean_content(self, text: str, label: str = "") -> str:
        """对文本进行质量清洗"""
        from rag_knowledge_base.embedding.cleaner import clean_text
        use_qwen = CLEANER_BACKEND == "qwen"
        return clean_text(text, use_qwen=use_qwen, threshold=CLEANER_THRESHOLD)

    def build_from_web(self, web_documents: list, incremental: bool = False):
        """从网络爬取数据构建向量库"""
        self._build_from_docs(web_documents, is_web=True, incremental=incremental)

    def build_from_local(self, raw_dir: Optional[Path] = None, incremental: bool = False):
        """从本地 raw 目录构建"""
        from llama_index.core import Document as LDocument

        if raw_dir is None:
            raw_dir = RAW_DIR

        # 先清洗 raw → cleaned
        from rag_knowledge_base.embedding.cleaner import batch_clean
        use_qwen = CLEANER_BACKEND == "qwen"
        batch_clean(input_dir=raw_dir, output_dir=CLEANED_DIR,
                     use_qwen=use_qwen, threshold=CLEANER_THRESHOLD)

        if not incremental:
            self._reset_index()

        # 读取 cleaned 文件
        cleaned_files = sorted(CLEANED_DIR.glob("*.txt"))
        if not cleaned_files:
            print("  ⚠️ 无 cleaned 文件")
            return

        # 已有的 chunks（增量模式）
        existing_by_text = set()
        if incremental and META_FILE.exists():
            for c in _load_metadata():
                existing_by_text.add(c["text"][:100])

        splitter = SentenceSplitter(
            chunk_size=CHUNK_SIZE,
            chunk_overlap=CHUNK_OVERLAP,
            separator="\n\n",
            paragraph_separator="\n\n",
            secondary_chunking_regex="[^,.;。！？\n]+[,.;。！？]?\n*",
        )

        all_chunks = _load_metadata() if incremental else []
        all_vectors = []

        for f in cleaned_files:
            try:
                text = f.read_text(encoding="utf-8").strip()
            except Exception:
                continue
            if not text:
                continue

            # 智能提取源名称（可识别 100_wikivoyage_nz.txt → wikivoyage）
            _KNOWN_SOURCES = {
                "wikipedia", "wikivoyage", "doc", "nzta", "aa",
                "teara", "police", "newzealand", "opentripmap",
            }
            _name_lower = f.name.lower()
            _source_name = "unknown"
            # 1) 从文件名里找已知源关键词
            for kw in _KNOWN_SOURCES:
                if kw in _name_lower:
                    _source_name = kw
                    break
            # 2) 退回到第一个非数字单词
            if _source_name == "unknown":
                _parts = f.name.rsplit(".", 1)[0].split("_")
                for p in _parts:
                    if not p.isdigit():
                        _source_name = p
                        break

            doc = LDocument(
                text=text,
                metadata={
                    "source": f.name,
                    "source_name": _source_name,
                    "category": "general",
                    "title": f.name,
                    "doc_type": "local",
                }
            )

            nodes = splitter.get_nodes_from_documents([doc])
            for node in nodes:
                node_text = node.get_content()
                if len(node_text.strip()) < 20:
                    continue
                # 增量去重
                if incremental and node_text[:100] in existing_by_text:
                    continue
                emb = self.embed_model.get_text_embedding(node_text)
                chunk_id = str(uuid.uuid4())
                all_chunks.append({
                    "id": chunk_id,
                    "text": node_text,
                    "metadata": node.metadata,
                })
                all_vectors.append(emb)

            print(f"  📄 {f.name[:40]}... {len(nodes)} 片段")

        if not all_vectors:
            print("  ⚠️ 没有新片段")
            return

        # 保存元数据
        _save_metadata(all_chunks)

        # 构建 FAISS 索引
        import faiss
        vectors = np.array(all_vectors).astype(np.float32)
        if len(vectors) == 0:
            print("  ⚠️ 空向量列表")
            return

        dim = vectors.shape[1]
        index = faiss.IndexFlatIP(dim)  # 内积 = cosine 相似度
        index.add(vectors)
        VECTOR_DIR.mkdir(parents=True, exist_ok=True)
        faiss.write_index(index, str(INDEX_FILE))

        print(f"本地构建完成，总片段: {len(all_chunks)}  |  FAISS 索引: {INDEX_FILE}")

    def _build_from_docs(self, documents: list, is_web: bool = False, incremental: bool = False):
        """通用文档构建逻辑"""
        from llama_index.core import Document as LDocument

        if not incremental:
            self._reset_index()

        print(f"🧹 清洗 {len(documents)} 个文档 (backend={CLEANER_BACKEND})...")

        splitter = SentenceSplitter(
            chunk_size=CHUNK_SIZE,
            chunk_overlap=CHUNK_OVERLAP,
            separator="\n\n",
            paragraph_separator="\n\n",
            secondary_chunking_regex="[^,.;。！？\n]+[,.;。！？]?\n*",
        )

        all_chunks = _load_metadata() if incremental else []
        all_vectors = []

        # 已有的 chunks 去重
        existing_by_text = set()
        if incremental:
            for c in all_chunks:
                existing_by_text.add(c["text"][:100])

        for doc_dict in documents:
            raw_text = doc_dict.get("content", "")
            cleaned = self._clean_content(raw_text, f"{doc_dict.get('source_name','?')}")
            if len(cleaned.strip()) < 50:
                continue

            metadata = {
                "source": doc_dict.get("url", ""),
                "source_name": doc_dict.get("source_name", "unknown"),
                "category": doc_dict.get("category", "general"),
                "title": doc_dict.get("title", ""),
                "doc_type": "web",
            }
            ldoc = LDocument(text=cleaned, metadata=metadata)

            nodes = splitter.get_nodes_from_documents([ldoc])
            for node in nodes:
                node_text = node.get_content()
                if len(node_text.strip()) < 20:
                    continue
                if incremental and node_text[:100] in existing_by_text:
                    continue
                emb = self.embed_model.get_text_embedding(node_text)
                chunk_id = str(uuid.uuid4())
                all_chunks.append({
                    "id": chunk_id,
                    "text": node_text,
                    "metadata": metadata,
                })
                all_vectors.append(emb)

        if not all_vectors:
            print("  ⚠️ 没有新片段")
            return

        _save_metadata(all_chunks)

        import faiss
        vectors = np.array(all_vectors).astype(np.float32)
        dim = vectors.shape[1]
        index = faiss.IndexFlatIP(dim)
        index.add(vectors)
        VECTOR_DIR.mkdir(parents=True, exist_ok=True)
        faiss.write_index(index, str(INDEX_FILE))

        print(f"\n🎉 完成！总片段: {len(all_chunks)}")

    def get_stats(self) -> Dict[str, Any]:
        """获取统计信息"""
        chunks = _load_metadata()
        if not chunks:
            return {"total_chunks": 0, "sources": [], "categories": []}
        sources = list(set(c["metadata"].get("source_name", "未知") for c in chunks))
        categories = list(set(c["metadata"].get("category", "未分类") for c in chunks))
        return {
            "total_chunks": len(chunks),
            "sources": sources,
            "categories": categories,
            "index_exists": INDEX_FILE.exists(),
        }


async def build_kb_from_network(incremental: bool = False):
    from rag_knowledge_base.crawler.crawl4ai_fetcher import fetch_all_sources
    print("=" * 60)
    print(f"🌐 网络抓取 → 清洗({CLEANER_BACKEND}) → 分片({CHUNK_SIZE}t) → {EMBED_BACKEND.upper()}嵌入 → FAISS")
    print("=" * 60)
    docs = await fetch_all_sources()
    if not docs:
        print("❌ 未抓取到内容")
        return
    builder = KnowledgeBaseBuilder()
    builder._build_from_docs(docs, is_web=True, incremental=incremental)
    stats = builder.get_stats()
    print(f"来源: {', '.join(stats['sources'][:5])}")


def build_kb_from_local(raw_dir: Path = None, incremental: bool = False):
    builder = KnowledgeBaseBuilder()
    builder.build_from_local(raw_dir, incremental=incremental)


def kb_stats():
    builder = KnowledgeBaseBuilder()
    stats = builder.get_stats()
    print(f"\n📊 总片段: {stats['total_chunks']}")
    print(f"来源: {', '.join(stats['sources'])}")
    print(f"分类: {', '.join(stats['categories'])}")
    if stats.get("index_exists"):
        print(f"✅ FAISS 索引存在")
    else:
        print(f"❌ FAISS 索引不存在")


if __name__ == "__main__":
    import asyncio
    import argparse

    parser = argparse.ArgumentParser(description="RAG 知识库构建器 (FAISS)")
    parser.add_argument("--mode", choices=["local", "network", "stats"], default="local")
    parser.add_argument("--incremental", action="store_true")
    parser.add_argument("--raw-dir", default=None)
    args = parser.parse_args()

    if args.mode == "network":
        asyncio.run(build_kb_from_network(incremental=args.incremental))
    elif args.mode == "local":
        build_kb_from_local(raw_dir=args.raw_dir, incremental=args.incremental)
    elif args.mode == "stats":
        kb_stats()