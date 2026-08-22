"""
基于 D:\\SJTU\\编程\\gemini-API 真实 Gemini 模型原生客户端连接服务
严格遵循 API_SPECIFICATION.md 与 README.md 调用规范
支持直连 AccountPool 与 OpenAI-Compatible 代理双模式
"""
import os
import sys
import json
import asyncio
from pathlib import Path
from typing import List, Dict, Any, Optional

# 动态加载 gemini-API 模块路径
GEMINI_API_DIR = Path(r"D:\SJTU\编程\gemini-API")
if (GEMINI_API_DIR / "src").exists() and str(GEMINI_API_DIR / "src") not in sys.path:
    sys.path.insert(0, str(GEMINI_API_DIR / "src"))

try:
    from gemini_webapi.account_pool import AccountPool
    from gemini_webapi.client import GeminiClient
    from gemini_webapi.constants import Model
    from gemini_webapi.exceptions import (
        GeminiError,
        AuthError,
        UsageLimitExceeded,
        TemporarilyBlocked,
        ModelInvalid,
        APIError,
        TimeoutError,
    )
    HAS_GEMINI_NATIVE = True
except ImportError:
    HAS_GEMINI_NATIVE = False

from backend.models.travel_schema import TravelPlanResponse


class GeminiNativeService:
    _instance = None
    _pool = None

    def __init__(self):
        self.cookies_path = GEMINI_API_DIR / "cookies.json"
        self.is_initialized = False
        self.enable_native = os.getenv("ENABLE_GEMINI_NATIVE", "false").lower() in ("true", "1", "yes")
        # 遵循 API_SPECIFICATION.md §2.1 规范，默认使用 3.7 Flash 旗舰推理模型
        self.default_model = os.getenv("LLM_MODEL", "gemini-3.7-flash")
        self._lock = None

    async def ensure_init(self):
        """确保 AccountPool 懒加载单例初始化 (符合 API_SPECIFICATION.md §4.1 规范)"""
        if not self.enable_native:
            return

        if self.is_initialized and self._pool:
            return

        if self._lock is None:
            self._lock = asyncio.Lock()

        async with self._lock:
            if not self.is_initialized:
                if not HAS_GEMINI_NATIVE or not self.cookies_path.exists():
                    print("⚠️ 未找到 gemini-webapi 依赖或 cookies.json")
                    return


                try:
                    data = json.loads(self.cookies_path.read_text(encoding="utf-8"))
                    accounts = []
                    if isinstance(data, list):
                        accounts.extend(data)
                    elif isinstance(data, dict):
                        accounts.append(data.get("cookies", data))

                    print(f"🚀 [GeminiNative] 正在按照 API_SPECIFICATION 初始化 {len(accounts)} 个 Google AI 账号池...")
                    # 遵循规范: min_interval=0.5 (防风控平滑间隔), max_concurrency_per_account=2 (单账号最大并发)
                    pool = AccountPool(
                        accounts_cookies=accounts,
                        min_interval=0.5,
                        max_concurrency_per_account=2
                    )
                    await pool.init()
                    self._pool = pool
                    self.is_initialized = True
                    print(f"✅ [GeminiNative] Gemini 原生账号池初始化完成！活跃账号数: {len(pool.clients)}")
                except Exception as e:
                    print(f"⚠️ [GeminiNative] 初始化账号池异常: {e}")

    async def generate_plan_async(self, query: str, context: str, data_sources: List[str]) -> Optional[TravelPlanResponse]:
        """异步调用真实 Gemini 模型生成结构化旅行规划 (符合 API_SPECIFICATION.md §3.2 规范)"""
        await self.ensure_init()
        if not self._pool:
            return None

        system_instruction = """你是一个顶级专业智能旅游规划师与资深风光摄影领队。
请根据用户的自然语言需求以及提供的参考资料（RAG本地私有知识库+联网搜索），生成一份高度标准化、高品质且具体的旅游规划方案。

你必须直接输出严格合法的标准 JSON，不得输出多余的解释文字。JSON 必须符合以下模式：

{
  "title": "行程规划总标题 (如：新西兰南岛 7 天绝美自驾与风光摄影之旅)",
  "summary": "行程特色概述与适合人群亮点 (如：贯穿特卡波湖、库克山、瓦纳卡与皇后镇的经典风光自驾路线)",
  "itineraries": [
    {
      "day": 1,
      "theme": "当日核心主题路线 (如：基督城 ➔ 特卡波湖)",
      "morning": "上午具体安排与景点",
      "afternoon": "下午具体安排与交通路线",
      "evening": "晚上安排与美食/星空/住宿",
      "transport": "交通建议与预估耗时 (如：自驾 SH8 · 220km / 2.8小时)",
      "tips": "实用避坑提醒或注意事项"
    }
  ],
  "must_visit_spots": [
    {
      "name": "地标或特色美食名称",
      "category": "分类：地标 或 美食",
      "rating": "5/5",
      "highlight": "核心亮点与必吃/必看理由",
      "address_or_area": "位置区域或推荐小店"
    }
  ],
  "photo_guides": [
    {
      "location": "拍摄机位或景点名称",
      "best_time": "最佳出片时间 (如：黄金时刻 17:30 / 深夜 22:00 银河季)",
      "composition_tips": "专业构图手法与拍摄视角建议",
      "camera_params": "推荐镜头焦段与曝光参数 (如：14-24mm f/2.8 · 20s · ISO 3200)",
      "outfit_color": "推荐穿搭或调色建议 (如：亮红色户外冲锋衣，形成强烈视觉反差)"
    }
  ]
}
"""

        full_prompt = f"{system_instruction}\n\n=== 用户需求 ===\n{query}\n\n=== 参考资料 ===\n{context}\n\n请直接输出 JSON："

        try:
            print(f"🤖 [GeminiNative] 正在使用标准模型 [{self.default_model}] (开启 Extended Thinking 拓展思考) 投递 Prompt...")
            # 按照规范传递标准模型名称与参数，默认开启拓展思考模式
            res = await self._pool.generate_content(
                full_prompt,
                model=self.default_model,
                extended_thinking=True
            )
            raw_text = res.text if hasattr(res, "text") else str(res)
            if not raw_text and hasattr(res, "candidates") and res.candidates:
                raw_text = res.candidates[0].text or ""

            import re
            clean_text = re.sub(r'<think>[\s\S]*?</think>', '', raw_text).strip()
            clean_json = clean_text
            if "```json" in clean_text:
                clean_json = clean_text.split("```json")[1].split("```")[0].strip()
            elif "```" in clean_text:
                clean_json = clean_text.split("```")[1].split("```")[0].strip()
            elif "{" in clean_text:
                json_match = re.search(r'(\{[\s\S]*\})', clean_text)
                if json_match:
                    clean_json = json_match.group(1).strip()

            parsed = None
            try:
                parsed = json.loads(clean_json)
            except Exception:
                for suffix in ['"}', '"]}', '}]}', '"}]}', '"}\n}', '"]}\n}', '}]']:
                    try:
                        parsed = json.loads(clean_json + suffix)
                        break
                    except Exception:
                        pass

            if not parsed or not isinstance(parsed, dict):
                raise ValueError("未在模型输出中找到合法的 JSON 结构")

            parsed["data_sources"] = data_sources
            return TravelPlanResponse(**parsed)
        except AuthError as e:
            print(f"❌ [GeminiNative] 账号 Cookie 鉴权失效 (AuthError): {e}，请按规范更新 cookies.json")
            return None
        except UsageLimitExceeded as e:
            print(f"⚠️ [GeminiNative] 账号算力额度达上限 (UsageLimitExceeded): {e}")
            return None
        except TemporarilyBlocked as e:
            print(f"⚠️ [GeminiNative] 触发 Google 临时频控 (TemporarilyBlocked): {e}")
            return None
        except ModelInvalid as e:
            print(f"⚠️ [GeminiNative] 模型名称无效 (ModelInvalid): {e}，建议回退至 gemini-3.7-flash / gemini-3.5-flash-lite")
            return None
        except Exception as e:
            print(f"⚠️ [GeminiNative] Gemini 推理或 JSON 解析异常: {e}")
            return None

    def generate_plan(self, query: str, context: str, data_sources: List[str]) -> Optional[TravelPlanResponse]:
        """同步包装入口，兼容独立线程与异步上下文，具备 3.5s 严格熔断防阻塞"""
        import concurrent.futures

        async def _safe_call():
            return await asyncio.wait_for(
                self.generate_plan_async(query, context, data_sources),
                timeout=3.5
            )

        try:
            try:
                loop = asyncio.get_running_loop()
            except RuntimeError:
                loop = None

            if loop and loop.is_running():
                with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
                    future = executor.submit(lambda: asyncio.run(_safe_call()))
                    return future.result(timeout=4.0)
            else:
                return asyncio.run(_safe_call())
        except Exception as e:
            print(f"ℹ️ [GeminiNative] 熔断或超时提示: {e}")
            return None

