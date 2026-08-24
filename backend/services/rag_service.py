"""
ChromaDB 本地向量知识库检索服务
"""

import sys
from pathlib import Path

import sys
from pathlib import Path

# 将项目根目录与 rag-knowledge-base 插入 sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
RAG_KB_DIR = PROJECT_ROOT / "rag_knowledge_base"

for p in [str(PROJECT_ROOT), str(RAG_KB_DIR)]:
    if p not in sys.path:
        sys.path.insert(0, p)

try:
    import chromadb
    CHROMA_AVAILABLE = True
except ImportError:
    CHROMA_AVAILABLE = False
    print("⚠️ chromadb 模块未安装，将启用轻量级内存/规则 Fallback")

from typing import List, Dict, Any

try:
    from config import CHROMA_DIR, COLLECTION_NAME
except ImportError:
    CHROMA_DIR = RAG_KB_DIR / "chroma_db"
    COLLECTION_NAME = "nz_travel_kb"


class RAGService:
    def __init__(self):
        self.chroma_dir = CHROMA_DIR
        self.collection_name = COLLECTION_NAME
        self.client = None
        self.collection = None
        if CHROMA_AVAILABLE:
            self._init_chroma()

    def _init_chroma(self):
        try:
            self.client = chromadb.PersistentClient(path=str(self.chroma_dir))
            self.collection = self.client.get_or_create_collection(self.collection_name)
        except Exception as e:
            print(f"⚠️ ChromaDB 初始化提示: {e}")
            self.client = None
            self.collection = None

    def search(self, query: str, top_k: int = 4) -> Dict[str, Any]:
        """
        检索 ChromaDB 知识库
        返回 dict: {"chunks": [...], "has_matches": bool, "max_score": float, "sources": [...]}
        """
        if not self.collection or self.collection.count() == 0:
            return {
                "chunks": [],
                "has_matches": False,
                "max_score": 0.0,
                "sources": []
            }

        try:
            results = self.collection.query(
                query_texts=[query],
                n_results=min(top_k, self.collection.count())
            )

            documents = results.get("documents", [[]])[0]
            metadatas = results.get("metadatas", [[]])[0]
            distances = results.get("distances", [[]])[0]

            chunks = []
            sources = set()

            for doc, meta, dist in zip(documents, metadatas, distances):
                # ChromaDB 默认使用 L2 距离，分值换算为相似度参考
                similarity = round(1.0 / (1.0 + float(dist)), 4) if dist is not None else 0.5
                source_name = meta.get("title") or meta.get("source_name") or meta.get("source") or "本地知识库"
                sources.add(source_name)

                chunks.append({
                    "content": doc,
                    "metadata": meta,
                    "similarity": similarity,
                    "source": source_name
                })

            max_score = max([c["similarity"] for c in chunks]) if chunks else 0.0

            return {
                "chunks": chunks,
                "has_matches": len(chunks) > 0 and max_score > 0.4,
                "max_score": max_score,
                "sources": list(sources)
            }
        except Exception as e:
            print(f"❌ RAG 检索异常: {e}")
            return {
                "chunks": [],
                "has_matches": False,
                "max_score": 0.0,
                "sources": []
            }
