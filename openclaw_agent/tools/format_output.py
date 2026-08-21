"""
行程格式化输出工具

将 LLM 生成的旅行计划原始文本，
整理为标准化的结构化输出。
"""

import json
import re
from typing import Optional


def format_trip_plan(raw_text: str) -> dict:
  """将 LLM 生成的原始 Markdown 行程格式化为结构化数据。

  前端需要：
  - summary: 概览信息（标题、天数、路线、预算）
  - daily_plan: 每日行程列表
  - tips: 实用贴士列表

  Args:
    raw_text: LLM 输出的原始 Markdown 文本

  Returns:
    结构化字典
  """
  return {
    "summary": _extract_summary(raw_text),
    "daily_plan": _extract_daily_plan(raw_text),
    "tips": _extract_tips(raw_text),
    "raw_markdown": raw_text,
  }


def _extract_summary(text: str) -> dict:
  """提取行程概览"""
  summary = {"title": "", "days": "", "route": "", "budget": ""}

  # 尝试从第一行或 ## 行程概览 后获取标题
  lines = text.strip().split("\n")
  if lines:
    summary["title"] = lines[0].strip("# ").strip()

  # 提取天数
  day_match = re.search(r'[天数天]\s*:?\s*(\d+)\s*[天日]', text)
  if day_match:
    summary["days"] = day_match.group(1)

  # 提取路线
  route_match = re.search(r'(?:路线|Route|路线概览)[：:]\s*(.+?)(?:\n|$)', text, re.IGNORECASE)
  if route_match:
    summary["route"] = route_match.group(1).strip()

  # 提取预算
  budget_match = re.search(r'(?:预算|Budget|费用)[：:]\s*(.+?)(?:\n|$)', text, re.IGNORECASE)
  if budget_match:
    summary["budget"] = budget_match.group(1).strip()

  return summary


def _extract_daily_plan(text: str) -> list[dict]:
  """提取每日行程列表"""
  days = []

  # 匹配 Day 1, Day 2 或 第一天, 第二天
  # 支持格式: ### Day 1 | **Day 1** | 第1天 等
  pattern = r'(?:#{1,4}\s*)?(?:Day|第)\s*(\d+)[天日\s\-—:：]*(.*?)(?=(?:#{1,4}\s*)?(?:Day|第)\s*\d+[天日]|\Z)'
  matches = re.findall(pattern, text, re.DOTALL | re.IGNORECASE)

  for day_num, content in matches:
    content = content.strip()
    days.append({
      "day": int(day_num),
      "title": _extract_day_title(content),
      "content": content,
    })

  return days


def _extract_day_title(content: str) -> str:
  """从每日内容中提取标题（通常是第一行目的地）"""
  lines = content.strip().split("\n")
  for line in lines:
    line = line.strip().strip("#* ").strip()
    if line and len(line) > 2:
      return line
  return ""


def _extract_tips(text: str) -> list[str]:
  """提取实用贴士"""
  tips = []
  # 找 "实用贴士" 或 "Tips" 段落后的列表项
  tip_section = re.search(
    r'(?:实用贴士|Tips|注意事项|贴士)[：:](.*?)(?=\n#{1,4}\s|$)',
    text,
    re.DOTALL | re.IGNORECASE,
  )
  if tip_section:
    content = tip_section.group(1)
    # 提取列表项（- 或 * 开头）
    items = re.findall(r'^[-*]\s+(.+)$', content, re.MULTILINE)
    tips = [item.strip() for item in items if item.strip()]

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
  if not LLM_API_KEY:
    try:
      from backend.services.gemini_service import GeminiNativeService
      svc = GeminiNativeService()
      user_text = "\n".join([m.get("content", "") for m in messages if m.get("role") == "user"])
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

  if system_prompt:
    full_messages = [{"role": "system", "content": system_prompt}]
    # 如果第一条消息已经是 system，替换它
    if messages and messages[0].get("role") == "system":
      messages = messages[1:]
    full_messages.extend(messages)
  else:
    full_messages = messages

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
    resp = requests.post(
      f"{LLM_API_BASE}/chat/completions",
      headers=headers,
      json=payload,
      timeout=60,
    )
    resp.raise_for_status()
    data = resp.json()
    return data["choices"][0]["message"]["content"]
  except Exception as e:
    return f" LLM 调用失败: {str(e)}"
