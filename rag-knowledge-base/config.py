"""RAG 知识库全局配置 — FAISS 版本（替换 ChromaDB）"""

import os
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any  # noqa: F401

BASE_DIR = Path(__file__).parent

# ===== 目录 =====
DATA_DIR = BASE_DIR / "data"
RAW_DIR = DATA_DIR / "raw"
CLEANED_DIR = DATA_DIR / "cleaned"
CHUNKS_DIR = DATA_DIR / "chunks"
# FAISS 索引和元数据存储位置
# 注意：faiss 的 C++ fopen() 不支持中文路径，必须用 ASCII-only 路径
_DEFAULT_VECTOR = str(BASE_DIR / "vector_db")
_ASCII_VECTOR = r"C:\Users\10581\.rag_cache\nz_travel_kb\vector_db"
VECTOR_DIR = Path(os.getenv("VECTOR_DIR", _ASCII_VECTOR if Path(r"C:\Users\10581").exists() else _DEFAULT_VECTOR))
# 确保目录存在
VECTOR_DIR.mkdir(parents=True, exist_ok=True)  # FAISS 索引 + 元数据存储位置

for d in [DATA_DIR, RAW_DIR, CLEANED_DIR, CHUNKS_DIR, VECTOR_DIR]:
    d.mkdir(parents=True, exist_ok=True)

# ChromaDB 目录
CHROMA_DIR = BASE_DIR / "chroma_db"

# ===== 检索策略 =====
DEFAULT_TOP_K = int(os.getenv("RETRIEVE_TOP_K", "5"))
RETRIEVE_MULTIPLIER = int(os.getenv("RETRIEVE_MULTIPLIER", "4"))
HYBRID_SEARCH = os.getenv("HYBRID_SEARCH", "true").lower() == "true"
NUM_QUERY_VARIANTS = int(os.getenv("NUM_QUERY_VARIANTS", "3"))
USE_HYDE = os.getenv("USE_HYDE", "true").lower() == "true"

# ===== 分片策略 =====
CHUNK_SIZE = int(os.getenv("CHUNK_SIZE", "512"))
CHUNK_OVERLAP = int(os.getenv("CHUNK_OVERLAP", "128"))
SMALL_CHUNK_SIZE = int(os.getenv("SMALL_CHUNK_SIZE", "128"))
SMALL_CHUNK_OVERLAP = int(os.getenv("SMALL_CHUNK_OVERLAP", "32"))

# ===== 清洗 =====
CLEANER_BACKEND = os.getenv("CLEANER_BACKEND", "qwen")
CLEANER_THRESHOLD = float(os.getenv("CLEANER_THRESHOLD", "0.5"))

# ===== Embedding 模型 =====
EMBED_BACKEND = os.getenv("EMBED_BACKEND", "bge")
EMBED_MODEL_HF_NAMES = {
    "bge": "BAAI/bge-m3",
    "bge-small": "BAAI/bge-small-zh-v1.5",
    "qwen": "Alibaba-NLP/gte-Qwen2-1.5B-instruct",
    "qwen-7b": "Alibaba-NLP/gte-Qwen2-7B-instruct",
}
EMBED_MODEL_PATH = os.getenv("EMBED_MODEL_PATH", "")
if EMBED_MODEL_PATH and Path(EMBED_MODEL_PATH).exists():
    EMBEDDING_MODEL = EMBED_MODEL_PATH
else:
    EMBEDDING_MODEL = EMBED_MODEL_HF_NAMES.get(EMBED_BACKEND, EMBED_MODEL_HF_NAMES["bge"])

EMBED_DIMENSIONS = {
    "bge": 1024,
    "bge-small": 384,
    "qwen": 1536,
    "qwen-7b": 4096,
}

# ===== 重排 =====
RERANKER_MODEL = os.getenv("RERANKER_MODEL", "BAAI/bge-reranker-v2-m3")
RERANKER_MODEL_PATH = os.getenv("RERANKER_MODEL_PATH", "")
if RERANKER_MODEL_PATH and Path(RERANKER_MODEL_PATH).exists():
    RERANKER_MODEL = RERANKER_MODEL_PATH
RERANK_TOP_K = int(os.getenv("RERANK_TOP_K", "5"))

# 向量数据库类型
# "chroma" | "faiss"
VECTOR_BACKEND = os.getenv("VECTOR_BACKEND", "faiss")

COLLECTION_NAME = os.getenv("CHROMA_COLLECTION", "nz_travel_kb")

# ===== 智能分类器配置 =====
CLASSIFIER_MODEL = os.getenv("CLASSIFIER_MODEL", os.getenv("QWEN_CLEANER_MODEL", "Qwen/Qwen2.5-1.5B-Instruct"))
CLASSIFIER_DEVICE = os.getenv("CLASSIFIER_DEVICE", os.getenv("QWEN_DEVICE", "cpu"))
CLASSIFIER_MAX_CHUNKS = int(os.getenv("CLASSIFIER_MAX_CHUNKS", "80"))
CLASSIFIER_DISCOVER = os.getenv("CLASSIFIER_DISCOVER", "true").lower() == "true"
ENABLE_AUTO_CLASSIFY = os.getenv("ENABLE_AUTO_CLASSIFY", "true").lower() == "true"