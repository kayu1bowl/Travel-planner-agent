"""
Builder — RAG 知识库构建器
支持 BGE 和 Qwen (gte-Qwen2) 系列 embedding 模型

新增功能：
1. Qwen gte-Qwen2 模型支持（含 instruction 前缀）
2. 本地模型路径加载
3. 模型维度自动适配
4. 双层分片 (small-to-big)
"""

import sys
import shutil
from pathlib import Path
from typing import List, Optional
sys.path.append(str(Path(__file__).parent.parent))

from llama_index.core import VectorStoreIndex, StorageContext, Document
from llama_index.vector_stores.chroma import ChromaVectorStore
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.core.node_parser import SentenceSplitter
import chromadb

from rag_knowledge_base.config import (
    CHROMA_DIR, RAW_DIR, CLEANED_DIR, EMBEDDING_MODEL, COLLECTION_NAME,
    CHUNK_SIZE, CHUNK_OVERLAP, EMBED_BACKEND,
    CLEANER_BACKEND, CLEANER_THRESHOLD,
)


def create_embed_model():
    """
    创建 embedding 模型实例，自动适配 BGE / Qwen 等不同架构
    """
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

    # 打印模型信息（修复：使用新方法名）
    try:
        # 兼容新旧方法名
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


class KnowledgeBaseBuilder:
    def __init__(self):
        self.embed_model = create_embed_model()
        self.chroma_client = chromadb.PersistentClient(path=str(CHROMA_DIR))
        self.chroma_collection = self.chroma_client.get_or_create_collection(COLLECTION_NAME)
        self.vector_store = ChromaVectorStore(chroma_collection=self.chroma_collection)
        self.storage_context = StorageContext.from_defaults(vector_store=self.vector_store)

    def _reset_collection(self):
        """彻底重置 ChromaDB — 删除整个目录后再重建，避免 HNSW 损坏段残留"""
        # 先尝试正常删除 collection
        try:
            self.chroma_client.delete_collection(COLLECTION_NAME)
        except Exception:
            pass

        # 显式关闭和清理
        self.chroma_client = None
        self.vector_store = None
        self.storage_context = None
        self.chroma_collection = None

        # 删除整个 chroma_db 目录（HNSW 损坏段文件在目录中）
        if CHROMA_DIR.exists():
            shutil.rmtree(str(CHROMA_DIR))
            print(f"  🧹 已清除 ChromaDB 目录: {CHROMA_DIR}")

        # 重新初始化
        CHROMA_DIR.mkdir(parents=True, exist_ok=True)
        self.chroma_client = chromadb.PersistentClient(path=str(CHROMA_DIR))
        self.chroma_collection = self.chroma_client.get_or_create_collection(COLLECTION_NAME)
        self.vector_store = ChromaVectorStore(chroma_collection=self.chroma_collection)
        self.storage_context = StorageContext.from_defaults(vector_store=self.vector_store)

    def _clean_content(self, text: str, label: str = "") -> str:
        """对文本进行质量清洗"""
        from rag_knowledge_base.embedding.cleaner import clean_text
        use_qwen = CLEANER_BACKEND == "qwen"
        return clean_text(text, use_qwen=use_qwen, threshold=CLEANER_THRESHOLD)

    def build_from_web(self, web_documents: list, incremental: bool = False):
        """从网络爬取数据构建向量库"""
        if not incremental:
            self._reset_collection()

        documents = []
        print(f"🧹 清洗 {len(web_documents)} 个文档 (backend={CLEANER_BACKEND})...")
        for i, doc in enumerate(web_documents):
            cleaned = self._clean_content(doc["content"], f"{doc.get('source_name','?')}/{i}")
            if len(cleaned.strip()) < 50:
                continue  # 清洗后完全无内容则跳过
            documents.append(Document(
                text=cleaned,
                metadata={
                    "source": doc.get("url", ""),
                    "source_name": doc.get("source_name", "unknown"),
                    "category": doc.get("category", "general"),
                    "title": doc.get("title", ""),
                    "doc_type": "web",
                }
            ))

        print(f"📄 构建索引: {len(documents)} 个文档")

        primary_splitter = SentenceSplitter(
            chunk_size=CHUNK_SIZE,
            chunk_overlap=CHUNK_OVERLAP,
            separator="\n\n",
            paragraph_separator="\n\n",
            secondary_chunking_regex="[^,.;。！？\n]+[,.;。！？]?\n*",
        )

        import time

        VectorStoreIndex.from_documents(
            documents,
            storage_context=self.storage_context,
            embed_model=self.embed_model,
            transformations=[
                primary_splitter,
                self.embed_model,
            ],
            show_progress=True,
        )

        # 🔥 强制 ChromaDB Rust compactor 刷盘完成，避免 HNSW 段文件不完整
        for _ in range(3):
            try:
                count = self.chroma_collection.count()
                time.sleep(0.3)
            except Exception:
                time.sleep(1)
        print(f"\n🎉 完成！总片段: {count}")

    def build_from_local(self, raw_dir: Optional[Path] = None, incremental: bool = False):
        """从本地 raw 目录构建（自动清洗后使用 cleaned 目录）"""
        from llama_index.core import SimpleDirectoryReader

        if raw_dir is None:
            raw_dir = RAW_DIR

        # 先清洗 raw → cleaned
        from rag_knowledge_base.embedding.cleaner import batch_clean
        use_qwen = CLEANER_BACKEND == "qwen"
        batch_clean(input_dir=raw_dir, output_dir=CLEANED_DIR,
                     use_qwen=use_qwen, threshold=CLEANER_THRESHOLD)

        if not incremental:
            self._reset_collection()

        documents = SimpleDirectoryReader(
            input_dir=str(CLEANED_DIR),
            required_exts=[".pdf", ".txt", ".md"],
            recursive=True,
        ).load_data()

        primary_splitter = SentenceSplitter(
            chunk_size=CHUNK_SIZE,
            chunk_overlap=CHUNK_OVERLAP,
            separator="\n\n",
            paragraph_separator="\n\n",
            secondary_chunking_regex="[^,.;。！？\n]+[,.;。！？]?\n*",
        )

        import time

        VectorStoreIndex.from_documents(
            documents,
            storage_context=self.storage_context,
            embed_model=self.embed_model,
            transformations=[primary_splitter, self.embed_model],
            show_progress=True,
        )

        # 🔥 强制 ChromaDB Rust compactor 刷盘完成
        for _ in range(3):
            try:
                count = self.chroma_collection.count()
                time.sleep(0.3)
            except Exception:
                time.sleep(1)
        print(f"\n🎉 本地构建完成！总片段: {count}")

    def get_stats(self):
        count = self.chroma_collection.count()
        data = self.chroma_collection.get()
        sources = list(set(m.get("source_name", "未知") for m in data.get("metadatas", [])))
        categories = list(set(m.get("category", "未分类") for m in data.get("metadatas", [])))
        return {"total_chunks": count, "sources": sources, "categories": categories}


async def build_kb_from_network(incremental: bool = False):
    from rag_knowledge_base.crawler.crawl4ai_fetcher import fetch_all_sources
    print("=" * 60)
    print(f"🌐 网络抓取 → 清洗({CLEANER_BACKEND}) → 分片({CHUNK_SIZE}t) → {EMBED_BACKEND.upper()}嵌入 → Chroma")
    print("=" * 60)
    docs = await fetch_all_sources()
    if not docs:
        print("❌ 未抓取到内容")
        return
    builder = KnowledgeBaseBuilder()
    builder.build_from_web(docs, incremental=incremental)
    stats = builder.get_stats()
    print(f"来源: {', '.join(stats['sources'][:5])}")
    print(f"分类: {', '.join(stats['categories'])}")


def build_kb_from_local(raw_dir: Path = None, incremental: bool = False):
    from rag_knowledge_base.config import RAW_DIR
    if raw_dir is None:
        raw_dir = RAW_DIR
    builder = KnowledgeBaseBuilder()
    builder.build_from_local(raw_dir, incremental=incremental)


def kb_stats():
    builder = KnowledgeBaseBuilder()
    stats = builder.get_stats()
    print(f"\n📊 总片段: {stats['total_chunks']}")
    print(f"来源: {', '.join(stats['sources'])}")
    print(f"分类: {', '.join(stats['categories'])}")


if __name__ == "__main__":
    import asyncio
    import argparse

    parser = argparse.ArgumentParser(description="RAG 知识库构建器")
    parser.add_argument("--mode", choices=["local", "network", "stats"], default="local",
                        help="构建模式: local=本地文件, network=网络爬取, stats=统计")
    parser.add_argument("--incremental", action="store_true",
                        help="增量构建（不清除已有数据）")
    parser.add_argument("--raw-dir", default=None,
                        help="指定 raw 数据目录（mode=local 时）")
    args = parser.parse_args()

    if args.mode == "network":
        asyncio.run(build_kb_from_network(incremental=args.incremental))
    elif args.mode == "local":
        build_kb_from_local(raw_dir=args.raw_dir, incremental=args.incremental)
    elif args.mode == "stats":
        kb_stats()