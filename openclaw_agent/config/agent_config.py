"""
智能体全局配置

通过环境变量覆盖所有配置，多级 fallback：
  1. 环境变量（最高优先级）
  2. 本文件中的默认值
  3. None / 空值

LLM 调用使用 OpenAI 兼容接口，支持 DeepSeek / 硅基流动 / 等。
"""

import os
from pathlib import Path
from typing import Optional

# ============================================================
# LLM 配置（OpenAI 兼容接口）
# ============================================================

# API 地址（优先检测本地 Gemini OpenAI 兼容服务）
has_gemini_cookies = Path(r"D:\SJTU\编程\gemini-API\cookies.json").exists()
default_base = "http://localhost:10000/v1" if has_gemini_cookies else "https://api.deepseek.com/v1"
default_model = "gemini-3.7-flash" if has_gemini_cookies else "deepseek-chat"
default_key = "gemini-local" if has_gemini_cookies else ""

LLM_API_BASE = os.getenv("LLM_API_BASE", default_base)
LLM_API_KEY = os.getenv("LLM_API_KEY", default_key)
LLM_MODEL = os.getenv("LLM_MODEL", default_model)
LLM_TEMPERATURE = float(os.getenv("LLM_TEMPERATURE", "0.7"))
LLM_MAX_TOKENS = int(os.getenv("LLM_MAX_TOKENS", "4096"))

# ============================================================
# RAG 配置（对接王同学的 rag_knowledge_base）
# ============================================================

RAG_TOP_K = int(os.getenv("RAG_TOP_K", "5"))
RAG_USE_RERANK = os.getenv("RAG_USE_RERANK", "true").lower() == "true"

# ============================================================
# Web 搜索配置
# ============================================================

# 可选后端: "tavily" | "serpapi" | "openclaw" | "mock"
WEB_SEARCH_BACKEND = os.getenv("WEB_SEARCH_BACKEND", "mock")

TAVILY_API_KEY = os.getenv("TAVILY_API_KEY", "")
SERPAPI_API_KEY = os.getenv("SERPAPI_API_KEY", "")

# ============================================================
# API 服务配置
# ============================================================

API_HOST = os.getenv("API_HOST", "0.0.0.0")
API_PORT = int(os.getenv("API_PORT", "8080"))
API_CORS_ORIGINS = os.getenv("API_CORS_ORIGINS", "*")


def validate() -> list[str]:
    """检查配置完整性，返回缺失的必填项列表"""
    warnings: list[str] = []
    has_gemini_cookies = Path(r"D:\SJTU\编程\gemini-API\cookies.json").exists()
    if not LLM_API_KEY and not has_gemini_cookies:
        warnings.append("未检测到 LLM_API_KEY 或 Gemini 原生账号池配置")
    if WEB_SEARCH_BACKEND == "tavily" and not TAVILY_API_KEY:
        warnings.append("TAVILY_API_KEY 未设置 — Tavily 搜索将失败")
    if WEB_SEARCH_BACKEND == "serpapi" and not SERPAPI_API_KEY:
        warnings.append("SERPAPI_API_KEY 未设置 — SerpAPI 搜索将失败")
    return warnings
