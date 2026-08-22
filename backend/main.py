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

from fastapi import Request
from fastapi.responses import RedirectResponse

@app.middleware("http")
async def force_https_and_hsts(request: Request, call_next):
    proto = request.headers.get("x-forwarded-proto", "").lower()
    if proto == "http":
        url = request.url.replace(scheme="https")
        return RedirectResponse(url=str(url), status_code=301)
    
    response = await call_next(request)
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"
    return response

# 挂载 API 路由
app.include_router(plan_router, prefix="/api/v1")

# 挂载静态前端构建产物（若存在 frontend/dist）
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

dist_dir = PROJECT_ROOT / "frontend" / "dist"
if dist_dir.exists():
    app.mount("/assets", StaticFiles(directory=dist_dir / "assets"), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        file_path = dist_dir / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(dist_dir / "index.html")
else:
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
