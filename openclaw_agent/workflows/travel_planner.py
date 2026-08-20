"""
旅行规划 Agent 主流程

核心流程:
 1. 用户输入需求 -> 意图理解
 2. RAG 知识库检索（获取私有资料）
 3. 联网搜索补充（实时信息）
 4. LLM 信息整合 -> 生成行程
 5. 格式化输出

流程设计为可重入函数，既给 OpenClaw agent 环境调用，
也给 FastAPI 后端调用。
"""

import sys
from pathlib import Path
from typing import Optional

_project_root = Path(__file__).resolve().parents[2]
if str(_project_root) not in sys.path:
  sys.path.insert(0, str(_project_root))

from openclaw_agent.tools.rag_search import rag_retrieve
from openclaw_agent.tools.web_search import search_web
from openclaw_agent.tools.format_output import call_llm, format_trip_plan
from openclaw_agent.config.agent_config import validate as validate_config


def _load_prompt(name: str) -> str:
  """加载 prompts 目录下的提示词文件"""
  prompt_path = Path(__file__).resolve().parent.parent / "prompts" / name
  if prompt_path.exists():
    return prompt_path.read_text(encoding="utf-8")
  return ""


def plan_trip(user_input: str, conversation_history: Optional[list] = None) -> dict:
  """旅行规划主入口

  这是一个通用函数，既可供 OpenClaw agent 直接调用，
  也可以被 FastAPI 后端调用生成行程。

  Args:
    user_input: 用户输入的旅行需求描述
    conversation_history: 可选的历史对话（用于追问补全信息）

  Returns:
    dict: {
      "success": bool,
      "plan": { ... } 或 None,
      "error": str | None,
      "needs_more_info": bool,
      "follow_up_question": str | None,
    }
  """
  # 1. 检查配置完整性
  warnings = validate_config()
  if warnings:
    return {
      "success": False,
      "plan": None,
      "error": "配置不完整: " + "; ".join(warnings),
      "needs_more_info": False,
      "follow_up_question": None,
    }

  # 2. 加载系统提示词
  system_prompt = _load_prompt("system_prompt.md")

  # 3. 分析用户需求是否完整
  info_check = _check_user_input_completeness(user_input)
  if info_check.get("missing"):
    return {
      "success": True,
      "plan": None,
      "error": None,
      "needs_more_info": True,
      "follow_up_question": info_check["question"],
    }

  # 4. 并行检索 RAG + 联网搜索
  print(f"\n  计划生成中...")
  print(f"  RAG 检索中...")
  rag_result = rag_retrieve(user_input)
  print(f"  联网搜索中...")
  web_result = search_web(user_input)

  # 5. 构建设计 prompt
  design_prompt = f"""你是一个新西兰旅行规划专家。请根据以下信息为用户生成一份详细的旅行计划。

## 用户的旅行需求
{user_input}

## 知识库检索结果
{rag_result}

## 联网搜索结果
{web_result}

请综合上述信息，生成一份完整的旅行计划。注意：
- 优先使用知识库中的私有资料
- 用联网信息补充实时数据（天气、路况、价格等）
- 标注信息来源（知识库/联网）
- 格式参考系统提示词中的模板
"""

  # 6. 调用 LLM 生成
  print(f"  LLM 生成行程中...")
  history = conversation_history or []
  messages = history + [{"role": "user", "content": design_prompt}]
  llm_output = call_llm(messages, system_prompt=system_prompt)

  if llm_output.startswith("⚠️") or llm_output.startswith("❌") or llm_output.startswith("Error"):
    return {
      "success": False,
      "plan": None,
      "error": llm_output,
      "needs_more_info": False,
      "follow_up_question": None,
    }

  # 7. 格式化输出
  structured = format_trip_plan(llm_output)

  return {
    "success": True,
    "plan": structured,
    "error": None,
    "needs_more_info": False,
    "follow_up_question": None,
  }


def _check_user_input_completeness(user_input: str) -> dict:
  """检查用户输入是否包含规划旅行所需的核心信息

  缺少的信息:
  - 天数
  - 目的地/路线
  - 旅行主题/兴趣
  - 预算（可选）
  - 季节/时间（可选）
  """
  missing_items = []

  # 有没有提到天数
  if not any(kw in user_input for kw in ["天", "日", "周", "week", "day"]):
    missing_items.append("天数")

  # 有没有提到目的地
  is_vague = any(kw in user_input for kw in ["随便", "推荐", "建议", "有什么"])
  has_destination = any(kw in user_input for kw in [
    "基督城", "皇后镇", "奥克兰", "特卡波", "瓦纳卡", "但尼丁",
    "南岛", "北岛", "新西兰", "Wellington", "Auckland", "Queenstown",
    "Christchurch",
  ])
  # 如果是纯粹的问句（推荐/有什么）不算缺目的地
  if not has_destination and not is_vague:
    missing_items.append("目的地偏好")

  question = ""
  if missing_items:
    if "天数" in missing_items and "目的地偏好" in missing_items:
      question = (
        "好的，我先了解一下你的想法 \n\n"
        "**请告诉我：**\n"
        "1 你计划玩几天？\n"
        "2 想去新西兰的哪些地方？(比如南岛还是北岛，或者具体城市)\n"
        "3 有什么特别的兴趣吗？(自驾/摄影/美食/徒步/极限运动...)\n\n"
        "有了这些信息，我就能给你定制一份超棒的旅行计划啦！"
      )
    elif "天数" in missing_items:
      question = "你这次计划玩几天喵？"
    elif "目的地偏好" in missing_items:
      question = (
        "你对新西兰的哪些地方感兴趣呢？\n"
        "比如南岛（基督城/皇后镇/特卡波）、北岛（奥克兰/罗托鲁瓦），"
        "或者有其他想法都可以说～"
      )
    else:
      question = "能再多说一些你的想法吗？比如天数、想去哪里、有什么兴趣偏好～"

  return {
    "missing": bool(missing_items),
    "items": missing_items,
    "question": question,
  }
