"""RAG 知识库全局配置"""

from pathlib import Path

BASE_DIR = Path(__file__).parent

DATA_DIR = BASE_DIR / "data"
CHROMA_DIR = BASE_DIR / "chroma_db"

for d in [DATA_DIR, DATA_DIR / "raw", DATA_DIR / "cleaned", CHROMA_DIR]:
    d.mkdir(parents=True, exist_ok=True)

EMBEDDING_MODEL = "BAAI/bge-m3"
COLLECTION_NAME = "nz_travel_kb"