"""
智能旅游规划 AI 应用 — 后端主入口 (FastAPI)
"""

import sys
from pathlib import Path

# 将根目录加入 sys.path 保证模块引用无隐患
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.append(str(PROJECT_ROOT))

try:
    from dotenv import load_dotenv
    load_dotenv(dotenv_path=PROJECT_ROOT / ".env")
except ImportError:
    pass

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.api.v1.plan import router as plan_router

app = FastAPI(
    title="智能旅游规划 AI 应用 Backend API",
    description="支持自然语言输入 -> ChromaDB RAG 私有知识库 + 全网实时搜索 -> 标准化行程清单输出",
    version="1.0.0"
)

# 配置 CORS 跨域访问
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 挂载 API 路由
app.include_router(plan_router, prefix="/api/v1")


@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "Travel Planner AI Agent Backend",
        "version": "1.0.0",
        "docs_url": "/docs"
    }


@app.get("/api/v1/health")
def health_check():
    return {"status": "ok", "message": "Backend service is healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=False)
