"""
测试与 D:\SJTU\编程\gemini-API 的本地大模型连接与结构化旅行规划生成
"""
import sys
import os
import json
import requests
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

# 添加 gemini-API src 路径
GEMINI_API_ROOT = Path(r"D:\SJTU\编程\gemini-API")
if str(GEMINI_API_ROOT / "src") not in sys.path:
    sys.path.insert(0, str(GEMINI_API_ROOT / "src"))

def test_gemini_openai_proxy():
    """测试通过 OpenAI-compatible 端点调用 Gemini"""
    url = "http://localhost:10000/v1/chat/completions"
    headers = {"Content-Type": "application/json"}
    payload = {
        "model": "gemini-2.5-flash",
        "messages": [
            {"role": "user", "content": "请用一句话介绍新西兰特卡波湖。"}
        ]
    }
    try:
        res = requests.post(url, json=payload, headers=headers, timeout=10)
        if res.status_code == 200:
            print("✅ Gemini OpenAI 代理服务在线响应:", res.json()["choices"][0]["message"]["content"][:60])
            return True
        else:
            print(f"ℹ️ Gemini 代理服务未开启 (HTTP {res.status_code})")
            return False
    except Exception as e:
        print("ℹ️ 本地 10000 端口 Gemini 服务当前未在后台运行 (连接提示:", e.__class__.__name__, ")")
        return False

if __name__ == "__main__":
    test_gemini_openai_proxy()
