"""
行程格式化输出工具

将 LLM 生成的旅行计划原始文本，
整理为标准化的结构化输出。
"""

import json
import re
from typing import Optional


def format_trip_plan(raw_text: str) -> dict:
  """将 LLM 生成的原始 Markdown 或 JSON 行程格式化为结构化数据。

  前端需要：
  - summary: 概览信息（标题、天数、路线、预算）
  - daily_plan: 每日行程列表
  - tips: 实用贴士列表

  Args:
    raw_text: LLM 输出的原始文本 (Markdown 或 JSON)

  Returns:
    结构化字典
  """
  # 1. 过滤思考标签（如 <think>...</think>）
  clean_text = re.sub(r'<think>[\s\S]*?</think>', '', raw_text).strip()

  # 2. 提取 Markdown 代码块中的 JSON
  candidate_json = ""
  if "```json" in clean_text:
    candidate_json = clean_text.split("```json")[1].split("```")[0].strip()
  elif "```" in clean_text:
    candidate_json = clean_text.split("```")[1].split("```")[0].strip()
  elif clean_text.startswith("{") and clean_text.endswith("}"):
    candidate_json = clean_text

  if candidate_json:
    parsed = _try_parse_json(candidate_json)
    if parsed:
      return _format_from_json_dict(parsed, clean_text)

  # 3. 尝试使用贪婪正则提取外层 JSON 结构
  json_match = re.search(r'(\{[\s\S]*\})', clean_text)
  if json_match:
    parsed = _try_parse_json(json_match.group(1).strip())
    if parsed:
      return _format_from_json_dict(parsed, clean_text)

  # 4. 若无法解析为合规 JSON，回退至正则 Markdown 解析
  return {
    "summary": _extract_summary(clean_text),
    "daily_plan": _extract_daily_plan(clean_text),
    "tips": _extract_tips(clean_text),
    "raw_markdown": clean_text,
  }


def _try_parse_json(json_str: str) -> Optional[dict]:
  """尝试解析 JSON 并在截断时进行常见结构修复"""
  try:
    return json.loads(json_str)
  except Exception:
    # 尝试自动补全常见截断语法
    repair_suffixes = ['"}', '"]}', '}]}', '"}]}', '"}\n}', '"]}\n}', '}]']
    for suffix in repair_suffixes:
      try:
        return json.loads(json_str + suffix)
      except Exception:
        continue
  return None


def _format_from_json_dict(data: dict, raw_text: str) -> dict:
  """从 JSON 结构字典转换为标准输出格式"""
  # 兼容 backend 原生 TravelPlanResponse 结构
  if "itineraries" in data and isinstance(data.get("itineraries"), list):
    daily_plan = []
    for itin in data.get("itineraries", []):
      d_num = itin.get("day", 1)
      d_title = itin.get("theme", f"Day {d_num}")
      morning = itin.get("morning", "")
      afternoon = itin.get("afternoon", "")
      evening = itin.get("evening", "")
      content = f"{morning}。{afternoon}。{evening}".strip("。")
      daily_plan.append({
        "day": d_num,
        "title": d_title,
        "content": content
      })
    
    tips = []
    for s in data.get("must_visit_spots", []):
      tips.append(f"【{s.get('name', '')}】: {s.get('highlight', '')}")
    for p in data.get("photo_guides", []):
      tips.append(f"【机位-{p.get('location', '')}】: {p.get('composition_tips', '')}")

    return {
      "summary": {
        "title": data.get("title", ""),
        "days": str(len(daily_plan)),
        "route": data.get("summary", ""),
        "budget": "适中"
      },
      "daily_plan": daily_plan,
      "tips": tips,
      "must_visit_spots": data.get("must_visit_spots", []),
      "photo_guides": data.get("photo_guides", []),
      "data_sources": data.get("data_sources", []),
      "raw_markdown": raw_text
    }

  return {
    "summary": data.get("summary", {}),
    "daily_plan": data.get("daily_plan", []),
    "tips": data.get("tips", []),
    "must_visit_spots": data.get("must_visit_spots", []),
    "photo_guides": data.get("photo_guides", []),
    "data_sources": data.get("data_sources", []),
    "raw_markdown": raw_text
  }


def _extract_summary(text: str) -> dict:
  """提取行程概览"""
  summary = {"title": "", "days": "", "route": "", "budget": ""}

  # 1. 优先提取加粗或各级标题中的专属行程标题
  title_m = re.search(r'(?:#+\s*|\*\*)([^\n\*]+?(?:旅行计划|路线|行程|之旅|游|Plan|Tour)[^\n\*]*?)(?:\*\*|\n|$)', text, re.IGNORECASE)
  if title_m:
    summary["title"] = title_m.group(1).strip().strip("#* ").strip()
  else:
    for line in text.split("\n"):
      l = line.strip().strip("#* -").strip()
      if l and not l.startswith("你好") and not l.startswith("Hello") and not l.startswith("作为") and len(l) > 3:
        summary["title"] = l
        break

  # 2. 提取天数（支持 "天数: 5天4夜"、"Duration: 7 Days" 等）
  day_match = re.search(r'(?:天数|Duration|Days?|行程周期)[：:\*]*\s*(\d+|[一二两三四五六七八九十]+)\s*[天日]', text, re.IGNORECASE)
  if day_match:
    summary["days"] = day_match.group(1)

  # 3. 提取路线
  route_match = re.search(r'(?:路线|Route|路线概览|推荐路线)[：:\*]*\s*(.+?)(?:\n|$)', text, re.IGNORECASE)
  if route_match:
    summary["route"] = route_match.group(1).strip().strip("* ").strip()

  # 4. 提取预算
  budget_match = re.search(r'(?:预算|Budget|费用|预算参考)[：:\*]*\s*(.+?)(?:\n|$)', text, re.IGNORECASE)
  if budget_match:
    summary["budget"] = budget_match.group(1).strip().strip("* ").strip()

  return summary


CHINESE_NUM_MAP = {
  "一": 1, "二": 2, "两": 2, "三": 3, "四": 4, "五": 5,
  "六": 6, "七": 7, "八": 8, "九": 9, "十": 10,
  "十一": 11, "十二": 12, "十三": 13, "十四": 14, "十五": 15
}


def _extract_daily_plan(text: str) -> list[dict]:
  """提取每日行程列表，兼容各类空格/冒号与汉字天数"""
  days = []

  # 1. 优先定位每日详细行程专属章节，避免概览摘要列表干扰
  target_text = text
  detail_headers = ["## 每日详细行程", "## 每日行程", "## 详细行程", "## 行程详情", "## Daily Itinerary", "## 每日路线"]
  for h in detail_headers:
    if h in text:
      target_text = text.split(h, 1)[1]
      break

  # 2. 匹配 ### Day 1, ### 第 1 天, **Day 1**, **第一天** 等每日块
  pattern = r'(?:^|\n)(?:#{1,4}\s*|\*{1,2}\s*)(?:Day\s*(\d+)|第\s*(\d+|[一二两三四五六七八九十]+)\s*[天日]?)\s*[:：\-—*]*(.*?)(?=(?:\n(?:#{1,4}\s*|\*{1,2}\s*)(?:Day\s*\d+|第\s*(?:\d+|[一二两三四五六七八九十]+)\s*[天日]?)|\n##\s+[^\n]+|\Z))'
  matches = re.findall(pattern, target_text, re.DOTALL | re.IGNORECASE)

  if not matches and target_text != text:
    matches = re.findall(pattern, text, re.DOTALL | re.IGNORECASE)

  seen_days = set()
  for m in matches:
    d1, d2, content = m
    day_str = (d1 or d2).strip()
    content = content.strip().strip("*")
    if day_str.isdigit():
      day_num = int(day_str)
    else:
      day_num = CHINESE_NUM_MAP.get(day_str, len(days) + 1)

    if day_num in seen_days:
      continue
    seen_days.add(day_num)

    days.append({
      "day": day_num,
      "title": _extract_day_title(content),
      "content": content,
    })

  # 若正则未能切分但文本不为空，兜底按段落划分成第 1 天
  if not days and len(text.strip()) > 30:
    days.append({
      "day": 1,
      "title": "全景规划总览",
      "content": text.strip()[:600]
    })

  return sorted(days, key=lambda x: x["day"])


def _extract_day_title(content: str) -> str:
  """从每日内容中提取标题（通常是第一行目的地或节点）"""
  lines = content.strip().split("\n")
  for line in lines:
    line = line.strip().strip("#* -:：>").strip()
    if line and len(line) > 2:
      return line
  return ""


def _extract_tips(text: str) -> list[str]:
  """提取实用贴士与地标建议"""
  tips = []
  tip_section = re.search(
    r'(?:实用贴士|Tips|注意事项|贴士|建议|必去地标|必访景点)[：:\*]*(.*?)(?=\n#{1,4}\s|\Z)',
    text,
    re.DOTALL | re.IGNORECASE,
  )
  if tip_section:
    content = tip_section.group(1)
    items = re.findall(r'^[-*]\s+(.+)$', content, re.MULTILINE)
    tips = [item.strip().strip("* ").strip() for item in items if item.strip()]

  return tips


# ============================================================
# LLM 调用工具（精简封装）
# ============================================================

import requests
from openclaw_agent.config.agent_config import (
  LLM_API_BASE,
  LLM_API_KEY,
  LLM_MODEL,
  LLM_TEMPERATURE,
  LLM_MAX_TOKENS,
  LLM_EXTENDED_THINKING,
)


def call_llm(messages: list[dict], system_prompt: Optional[str] = None) -> str:
  """调用 LLM（OpenAI 兼容接口）

  Args:
    messages: 对话消息列表 [{"role": "user", "content": "..."}, ...]
    system_prompt: 可选的 system prompt，会插入到 messages 最前面

  Returns:
    LLM 生成的文本
  """
  # 规范化消息历史：确保不以孤立的 assistant 消息开头
  sanitized_messages = []
  user_found = False
  for m in messages:
    role = m.get("role")
    if role == "user":
      user_found = True
    if user_found or role == "system":
      sanitized_messages.append(m)

  if not sanitized_messages and messages:
    # 兜底：如果过滤后为空，将最后一条消息作为 user 消息
    sanitized_messages = [{"role": "user", "content": str(messages[-1].get("content") or "")}]

  if not LLM_API_KEY:
    try:
      from backend.services.gemini_service import GeminiNativeService
      svc = GeminiNativeService()
      user_text = "\n".join([m.get("content", "") for m in sanitized_messages if m.get("role") == "user"])
      sys_text = system_prompt or "你是一个专业旅行规划智能体。"
      combined_prompt = f"{sys_text}\n\n{user_text}"
      
      import asyncio
      loop = None
      try:
        loop = asyncio.get_event_loop()
      except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
      async def _ask():
        await svc.ensure_init()
        if svc._pool:
          res = await svc._pool.generate_content(
            combined_prompt,
            model=LLM_MODEL,
            extended_thinking=LLM_EXTENDED_THINKING
          )
          return res.text if hasattr(res, "text") else str(res)
        return None

      if loop.is_running():
        import nest_asyncio
        nest_asyncio.apply()
        gen_text = loop.run_until_complete(_ask())
      else:
        gen_text = loop.run_until_complete(_ask())
        
      if gen_text:
        return gen_text
    except Exception as ex:
      print(f"⚠️ [GeminiNative Fallback] {ex}")
    return "⚠️ LLM_API_KEY 未配置，请设置环境变量后再试。"

  # 构造完整的提示词
  if system_prompt:
    full_messages = [{"role": "system", "content": system_prompt}]
    if sanitized_messages and sanitized_messages[0].get("role") == "system":
      sanitized_messages = sanitized_messages[1:]
    full_messages.extend(sanitized_messages)
  else:
    full_messages = sanitized_messages

  # 1. 如果配置了 LLM_API_KEY，首先尝试 OpenAI 兼容接口
  if LLM_API_KEY:
    headers = {
      "Authorization": f"Bearer {LLM_API_KEY}",
      "Content-Type": "application/json",
    }
    payload = {
      "model": LLM_MODEL,
      "messages": full_messages,
      "temperature": LLM_TEMPERATURE,
      "max_tokens": LLM_MAX_TOKENS,
      "extended_thinking": LLM_EXTENDED_THINKING,
    }
    try:
      print(f"🚀 [OpenClaw LLM] 正在调用 Gemini 3.7 API ({LLM_API_BASE})...")
      resp = requests.post(
        f"{LLM_API_BASE}/chat/completions",
        headers=headers,
        json=payload,
        timeout=60.0,
        allow_redirects=True,
      )
      if resp.status_code == 200:
        data = resp.json()
        print(f"🌟 [OpenClaw LLM] 成功获取大模型生成内容！")
        return data["choices"][0]["message"]["content"]
      else:
        print(f"⚠️ [OpenClaw LLM] 响应状态码: {resp.status_code} - {resp.text[:150]}")
    except Exception as ex:
      print(f"ℹ️ [OpenClaw LLM Proxy] HTTP 代理未响应 ({ex})，切换至 GeminiNative 账号池...")

  # 2. 级联降级：尝试 Gemini 原生账号池服务
  try:
    from backend.services.gemini_service import GeminiNativeService
    svc = GeminiNativeService()
    user_text = "\n".join([m.get("content", "") for m in sanitized_messages if m.get("role") == "user"])
    sys_text = system_prompt or "你是一个专业旅行规划智能体。"
    combined_prompt = f"{sys_text}\n\n{user_text}"

    import concurrent.futures
    import asyncio

    async def _ask_native():
      await svc.ensure_init()
      if svc._pool:
        res = await svc._pool.generate_content(
          combined_prompt,
          model=LLM_MODEL,
          extended_thinking=LLM_EXTENDED_THINKING
        )
        return res.text if hasattr(res, "text") else str(res)
      return None

    try:
      loop = asyncio.get_running_loop()
    except RuntimeError:
      loop = None

    if loop and loop.is_running():
      with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
        future = executor.submit(lambda: asyncio.run(asyncio.wait_for(_ask_native(), timeout=3.5)))
        gen_text = future.result(timeout=3.8)
    else:
      gen_text = asyncio.run(asyncio.wait_for(_ask_native(), timeout=3.5))

    if gen_text:
      print(f"🌟 [OpenClaw] 成功由 Gemini 原生模型生成行程方案！")
      return gen_text
  except Exception as ex:
    print(f"ℹ️ [GeminiNative Fallback] {ex}")

  # 3. 兜底方案：调用内置全球目的地高性能规则引擎方案
  user_q = ""
  for m in reversed(sanitized_messages):
    if m.get("role") == "user":
      content_str = str(m.get("content", ""))
      if "## 用户的旅行需求" in content_str:
        user_q = content_str.split("## 用户的旅行需求")[1].split("##")[0].strip()
      else:
        user_q = content_str.strip()
      break

  try:
    from backend.services.agent_router import AgentRouter
    router = AgentRouter()
    fallback_plan = router._generate_smart_fallback(user_q or "定制旅行规划", ["全网旅行搜索与前沿资讯"])
    plan_dict = fallback_plan.dict() if hasattr(fallback_plan, "dict") else fallback_plan.model_dump()
    return json.dumps(plan_dict, ensure_ascii=False, indent=2)
  except Exception as ex:
    print(f"⚠️ [Smart Fallback Error] {ex}")

  # 4. 极端兜底：生成结构化应急 Markdown
  dest = user_q[:16] if user_q else "目的地"
  return f"""# {dest} 5天深度定制旅行规划

## 行程概览
- **天数**: 5天
- **路线**: 核心地标 -> 景观漫游 -> 深度探索 -> 摄影机位 -> 悠闲返程
- **预算**: 适中舒适

## 每日详细行程

### 第一天 初遇探索与地标打卡
- 上午：抵达目的地，办理入住，休整后前往核心观光街区。
- 下午：游览标志性历史地标与人文景观，感受当地风土人情。
- 晚上：打卡高评分特色风味餐厅，欣赏城市/小镇夜景。

### 第二天 自然胜境与深度探索
- 上午：出发前往核心自然景区，沿途欣赏景观公路风光。
- 下午：徒步体验代表性观景步道，打卡精华景观。
- 晚上：体验特色温泉或特色住宿，享受静谧时光。

### 第三天 黄金机位与风光摄影
- 上午：清晨前往黄金日出机位拍摄晨曦光影。
- 下午：深度探访周边特色村落或地貌景观。
- 晚上：星空观测或地道夜市风味巡礼。

### 第四天 人文风物与休闲体验
- 上午：探访当地手工艺街区或特色博物馆。
- 下午：体验特色户外活动或咖啡茶歇。
- 晚上：品尝主厨推荐当季风味料理。

### 第五天 伴手礼采买与返程
- 上午：漫步清晨街市，选购当地特色纪念伴手礼。
- 下午：前往机场/车站，结束美好的定制之旅。

## 必去地标与风味美食
- 【核心地标】: 必访经典核心地标，尽享代表性自然与人文风光。
- 【地道风味】: 精选当地高分特色美食名店，品尝原汁原味地道风味。

## 摄影机位建议
- 【全景黄金机位】: 广角顺光构图，捕捉晨曦/黄昏时分绝佳光影层次。

## 实用贴士
- 建议提前确认各景区开园时间与门票预约规则
- 携带常用药品与防风保暖衣物
"""


