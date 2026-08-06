import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from llama_index.core import VectorStoreIndex, StorageContext, Document
from llama_index.vector_stores.chroma import ChromaVectorStore
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.core.node_parser import SentenceSplitter
import chromadb

from rag_knowledge_base.config import CHROMA_DIR, EMBEDDING_MODEL, COLLECTION_NAME


class KnowledgeBaseBuilder:
    def __init__(self):
        self.embed_model = HuggingFaceEmbedding(model_name=EMBEDDING_MODEL, trust_remote_code=True)
        self.chroma_client = chromadb.PersistentClient(path=str(CHROMA_DIR))
        self.chroma_collection = self.chroma_client.get_or_create_collection(COLLECTION_NAME)
        self.vector_store = ChromaVectorStore(chroma_collection=self.chroma_collection)
        self.storage_context = StorageContext.from_defaults(vector_store=self.vector_store)

    def build_from_web(self, web_documents: list, incremental: bool = False):
        if not incremental:
            self.chroma_collection.delete(where={"id": {"$ne": "no-such-id"}})
        documents = []
        for doc in web_documents:
            documents.append(Document(
                text=doc["content"],
                metadata={
                    "source": doc["url"],
                    "source_name": doc["source_name"],
                    "category": doc["category"],
                    "title": doc["title"]
                }
            ))
        print(f"📄 构建索引: {len(documents)} 个文档")
        VectorStoreIndex.from_documents(
            documents,
            storage_context=self.storage_context,
            embed_model=self.embed_model,
            transformations=[SentenceSplitter(chunk_size=512, chunk_overlap=128)],
            show_progress=True
        )
        count = self.chroma_collection.count()
        print(f"\n🎉 完成！总片段: {count}")

    def build_from_local(self, raw_dir: Path, incremental: bool = False):
        from llama_index.core import SimpleDirectoryReader
        if not incremental:
            self.chroma_collection.delete(where={})
        documents = SimpleDirectoryReader(
            input_dir=str(raw_dir),
            required_exts=[".pdf", ".txt", ".md"],
            recursive=True
        ).load_data()
        VectorStoreIndex.from_documents(
            documents,
            storage_context=self.storage_context,
            embed_model=self.embed_model,
            transformations=[SentenceSplitter(chunk_size=512, chunk_overlap=128)],
            show_progress=True
        )
        print(f"\n🎉 本地构建完成！总片段: {self.chroma_collection.count()}")

    def get_stats(self):
        count = self.chroma_collection.count()
        data = self.chroma_collection.get()
        sources = list(set(m.get("source_name", "未知") for m in data.get("metadatas", [])))
        categories = list(set(m.get("category", "未分类") for m in data.get("metadatas", [])))
        return {"total_chunks": count, "sources": sources, "categories": categories}


async def build_kb_from_network(incremental: bool = False):
    from rag_knowledge_base.crawler.crawl4ai_fetcher import fetch_all_sources
    print("=" * 50)
    print("🌐 网络自动抓取 → LlamaIndex → Chroma")
    print("=" * 50)
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
    from rag_knowledge_base.config import DATA_DIR
    if raw_dir is None:
        raw_dir = DATA_DIR / "raw"
    builder = KnowledgeBaseBuilder()
    builder.build_from_local(raw_dir, incremental=incremental)


def kb_stats():
    builder = KnowledgeBaseBuilder()
    stats = builder.get_stats()
    print(f"\n📊 总片段: {stats['total_chunks']}")
    print(f"来源: {', '.join(stats['sources'])}")
    print(f"分类: {', '.join(stats['categories'])}")