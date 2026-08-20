"""
联网搜索工具

提供统一的联网搜索接口，支持多个后端。
当前 Demo 阶段默认用 mock 模式（返回模拟数据），
部署时切换到真实后端。

支持后端:
  - mock:    返回模拟结果（开发调试用）
  - openclaw:通过 OpenClaw 内置 web_search 能力（需要运行在 OpenClaw 环境中）
  - tavily:  通过 tavily API（需要 TAVILY_API_KEY）
  - serpapi: 通过 SerpAPI（需要 SERPAPI_API_KEY）
"""

import os
import sys
import json
from pathlib import Path
from typing import Optional

_project_root = Path(__file__).resolve().parents[2]
if str(_project_root) not in sys.path:
    sys.path.insert(0, str(_project_root))

from openclaw_agent.config.agent_config import (
    WEB_SEARCH_BACKEND,
    TAVILY_API_KEY,
    SERPAPI_API_KEY,
)


def search_web(query: str, max_results: int = 5) -> str:
    """联网搜索，返回格式化文本结果。

    根据 config 中 WEB_SEARCH_BACKEND 选择后端。
    """
    backend = WEB_SEARCH_BACKEND.lower()

    if backend == "openclaw":
        return _search_openclaw(query, max_results)
    elif backend == "tavily":
        return _search_tavily(query, max_results)
    elif backend == "serpapi":
        return _search_serpapi(query, max_results)
    else:
        return _search_mock(query, max_results)


def _search_openclaw(query: str, max_results: int = 5) -> str:
    """通过 OpenClaw 内置的 web_search 能力搜索。

    注意：此函数只能在 OpenClaw agent 运行环境中使用。
    在 FastAPI 独立服务中不可用，会 fallback 到 mock。
    """
    try:
        # 尝试调用 OpenClaw web_search
        # 在 OpenClaw 环境中，有一个全局的 web_search 函数可用
        import __main__ as main_mod
        if hasattr(main_mod, '__file__') and 'openclaw' in str(getattr(main_mod, '__file__', '')).lower():
            # 运行在 OpenClaw 环境中 - 通过 exec 调用
            pass
    except Exception:
        pass

    # fallback: 用 requests 简单抓取 Google/Bing 搜索结果
    # 但这种方法不稳定，降级到 mock
    print("  ⚠️ OpenClaw web_search 不可用，降级到 mock 模式")
    return _search_mock(query, max_results)


def _search_tavily(query: str, max_results: int = 5) -> str:
    """使用 Tavily API 搜索"""
    if not TAVILY_API_KEY:
        return "【联网搜索】TAVILY_API_KEY 未配置。请在环境变量中设置后再试。"

    try:
        from tavily import TavilyClient
        client = TavilyClient(api_key=TAVILY_API_KEY)
        response = client.search(query=query, max_results=max_results)
        results = response.get("results", [])
        if not results:
            return "【联网搜索】未找到相关结果。"

        output = f"【联网搜索结果】共 {len(results)} 条：\n\n"
        for i, r in enumerate(results, 1):
            title = r.get("title", "无标题")
            url = r.get("url", "")
            snippet = r.get("content", r.get("snippet", ""))
            output += f"{i}. [{title}]({url})\n   {snippet}\n\n"
        return output
    except ImportError:
        return "【联网搜索】tavily 库未安装，请执行: pip install tavily-python"
    except Exception as e:
        return f"【联网搜索】Tavily 搜索失败: {str(e)}"


def _search_serpapi(query: str, max_results: int = 5) -> str:
    """使用 SerpAPI 搜索"""
    if not SERPAPI_API_KEY:
        return "【联网搜索】SERPAPI_API_KEY 未配置。请在环境变量中设置后再试。"

    try:
        import requests
        params = {
            "q": query,
            "api_key": SERPAPI_API_KEY,
            "engine": "google",
            "num": max_results,
        }
        resp = requests.get("https://serpapi.com/search", params=params, timeout=15)
        data = resp.json()
        organic = data.get("organic_results", [])
        if not organic:
            return "【联网搜索】未找到相关结果。"

        output = f"【联网搜索结果】共 {len(organic)} 条：\n\n"
        for i, r in enumerate(organic[:max_results], 1):
            title = r.get("title", "无标题")
            url = r.get("link", "")
            snippet = r.get("snippet", "")
            output += f"{i}. [{title}]({url})\n   {snippet}\n\n"
        return output
    except Exception as e:
        return f"【联网搜索】SerpAPI 搜索失败: {str(e)}"


def _search_mock(query: str, max_results: int = 5) -> str:
    """Mock 模式 — 返回模拟结果，方便前端开发调试"""
    mock_results = {
        "皇后镇": [
            "皇后镇 (Queenstown) 是新西兰南岛的极限运动之都，位于瓦卡蒂普湖畔。",
            "推荐活动：米尔福德峡湾游船、蹦极（卡瓦劳大桥）、天际缆车、蒸汽船巡游。",
            "最佳季节：春秋季（10-12月、3-5月）天气温和，游客较少。",
            "摄影机位：天际缆车山顶观景台、格伦诺基 (Glenorchy)、瓦卡蒂普湖日出。",
            "住宿建议：预算充足住湖畔酒店，预算有限住镇外民宿或青年旅舍。",
        ],
        "自驾": [
            "新西兰南岛经典自驾路线：基督城 → 特卡波 → 瓦纳卡 → 皇后镇 → 但尼丁 → 基督城。",
            "租车建议：在基督城机场取还，推荐租车平台 Rentalcars / 租租车。",
            "驾驶提示：靠左行驶，南岛山路多且弯道急，建议买全险。",
            "注意：冬季（6-8月）南岛部分路段可能有冰雪，需确认是否配雪链。",
            "限速：高速公路 100km/h，市区 50km/h，超速罚款较高。",
        ],
        "摄影": [
            "新西兰是风光摄影天堂，推荐携带广角镜头（16-35mm）和三脚架。",
            "特卡波湖好牧羊人教堂银河：4-9月最佳，避开满月前后。",
            "瓦纳卡孤独的树：清晨日出时逆光拍摄最佳。",
            "皇后镇天际缆车顶：日落前后拍全景，蓝调时刻尤为出片。",
            "格伦诺基 (Glenorchy)：指环王取景地，山脉+湖景，阴天也有氛围。",
        ],
        "签证": [
            "中国公民前往新西兰需要申请旅游签证（Visitor Visa）。",
            "在线申请通过 Immigration NZ 官网，处理时间通常 2-4 周。",
            "所需材料：护照、照片、行程单、机票预订、酒店预订、资金证明。",
            "签证有效期通常 1-5 年，每次停留不超过 3 个月。",
            "建议提前 2-3 个月申请，避开旺季（10-12月）的申请高峰。",
        ],
        "Milford Sound cruise 米尔福德峡湾游船": [
            "米尔福德峡湾 (Milford Sound) 是新西兰最著名的峡湾景点。",
            "游船公司：RealNZ、Mitre Peak Cruises、Southern Discoveries。",
            "行程时长：1.5 - 2 小时船程，建议选含午餐的套餐。",
            "最佳时间：清晨出发（8-9am），海面平静且游客较少。",
            "交通：从皇后镇出发约 4 小时车程，也可选择巴士/飞机+游船套餐。",
            "注意事项：峡湾年降雨量很大，准备好雨衣，但雨天的瀑布更为壮观。",
        ],
    }

    # 尝试匹配关键词
    matched = []
    for keyword, items in mock_results.items():
        if keyword.lower() in query.lower() or any(
            word.lower() in keyword.lower() for word in query.split()
        ):
            matched.extend(items)

    if not matched:
        # 默认新西兰通用信息
        matched = [
            f"关于「{query}」的新西兰旅行信息。请稍后使用 RAG 知识库进一步检索。",
            "提示：当前为 demo 模式，联网搜索返回的是模拟数据。",
            "部署时请设置 WEB_SEARCH_BACKEND=tavily 并配置 TAVILY_API_KEY。",
        ]

    output = f"【联网搜索结果】共 {len(matched)} 条（demo 模式）：\n\n"
    for i, item in enumerate(matched[:max_results], 1):
        output += f"{i}. {item}\n\n"
    return output


if __name__ == "__main__":
    # 测试
    for q in ["皇后镇摄影", "新西兰自驾", "签证"]:
        print(f"\n🔍 搜索: {q}")
        print("=" * 60)
        print(search_web(q))
