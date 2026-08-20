r"""
测试与 D:\SJTU\编程\gemini-API 的大模型连接与结构化旅行规划生成
严格遵循 API_SPECIFICATION.md 与 README.md 调用规范
"""
import sys
import os
import json
import asyncio
import requests
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

# 添加 gemini-API src 路径
GEMINI_API_ROOT = Path(r"D:\SJTU\编程\gemini-API")
if str(GEMINI_API_ROOT / "src") not in sys.path:
    sys.path.insert(0, str(GEMINI_API_ROOT / "src"))

from backend.services.gemini_service import GeminiNativeService


def test_gemini_openai_proxy():
    """测试通过 OpenAI-compatible 端点调用 Gemini (规范 5.2)"""
    ports = [10000, 8000]
    for port in ports:
        url = f"http://localhost:{port}/v1/chat/completions"
        headers = {"Content-Type": "application/json"}
        payload = {
            "model": "gemini-3.7-flash",
            "messages": [
                {"role": "user", "content": "请用一句话介绍新西兰特卡波湖。"}
            ]
        }
        try:
            res = requests.post(url, json=payload, headers=headers, timeout=5)
            if res.status_code == 200:
                print(f"✅ Gemini OpenAI 代理服务 (:{port}) 在线响应: {res.json()['choices'][0]['message']['content'][:60]}")
                return True
        except Exception:
            pass
    print("ℹ️ 本地 10000/8000 端口 Gemini OpenAI 服务当前未在后台运行")
    return False


async def test_gemini_native_account_pool():
    """测试直接使用 AccountPool 直连 (规范 4.1 & 3.2)"""
    print("\n🔍 正在测试 Gemini 原生 AccountPool 直连...")
    svc = GeminiNativeService()
    await svc.ensure_init()
    if svc._pool:
        print(f"✅ AccountPool 成功挂载 {len(svc._pool.clients)} 个活跃账号！")
        return True
    else:
        print("ℹ️ 未挂载 AccountPool 活跃实例")
        return False


if __name__ == "__main__":
    test_gemini_openai_proxy()
    asyncio.run(test_gemini_native_account_pool())
