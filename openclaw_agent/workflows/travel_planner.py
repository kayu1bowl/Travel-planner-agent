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

  # 3. 分析用户需求是否完整（结合历史对话上下文综合判断）
  info_check = _check_user_input_completeness(user_input, conversation_history)
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

  combined_context = f"""=== 知识库检索结果 ===\n{rag_result}\n\n=== 联网搜索结果 ===\n{web_result}"""
  data_sources = []
  if rag_result and "未找到" not in str(rag_result):
    data_sources.append("ChromaDB 私有向量库")
  if web_result:
    data_sources.append("全网实时搜索")

  # 5. 优先使用 OpenClaw 多阶段 Agent 协同流水线 (Multi-Stage Pipeline)
  try:
    from openclaw_agent.workflows.multi_stage_planner import run_multi_stage_pipeline
    multi_plan = run_multi_stage_pipeline(user_input, combined_context, data_sources)
    if multi_plan and multi_plan.get("itineraries"):
      print(f"🌟 [OpenClaw] 多阶段 Agent 规划生成成功: {multi_plan.get('title')}")
      return {
        "success": True,
        "plan": multi_plan,
        "error": None,
        "needs_more_info": False,
        "follow_up_question": None,
      }
  except Exception as stage_err:
    print(f"⚠️ [Multi-Stage Fallback] {stage_err}，尝试单次大模型降级...")

  # 6. 单次大模型降级备选方案
  design_prompt = f"""你是一个顶级专业智能旅行规划专家。请根据以下信息为用户生成一份结构化、高品质且具体的旅行计划。

## 用户的旅行需求
{user_input}

## 知识库检索结果
{rag_result}

## 联网搜索结果
{web_result}

请综合上述信息，生成一份完整的旅行计划，结构清晰，按天详细规划，包含必去景点/特色美食与摄影机位建议。
"""
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


def _check_user_input_completeness(user_input: str, conversation_history: Optional[list] = None) -> dict:
  """检查用户输入及上下文是否包含规划旅行所需的核心信息

  支持全球目的地，融合多轮对话历史，避免死循环追问。
  """
  # 聚合当前输入与历史对话文本，防止单句补充信息时状态丢失
  history_texts = []
  user_turns = 0
  if conversation_history and isinstance(conversation_history, list):
    for m in conversation_history:
      if isinstance(m, dict):
        role = m.get("role") or m.get("sender")
        if role == "user":
          user_turns += 1
        history_texts.append(str(m.get("content") or m.get("text") or ""))
  
  full_context = (" ".join(history_texts) + " " + user_input).strip()
  cleaned_input = user_input.strip()
  lower_input = cleaned_input.lower()

  # A. 自我介绍 / 功能问询 (如 "你好，你能干什么", "你能做什么", "你是谁", "介绍一下自己", "怎么用", "有什么功能")
  capability_triggers = [
    "你能干什么", "你能做什么", "你能帮我", "你可以做什么", "你是谁", "介绍一下自己", 
    "介绍一下", "功能", "怎么用", "如何使用", "what can you do", "who are you", "help", "帮助"
  ]
  if any(t in lower_input for t in capability_triggers):
    return {
      "missing": True,
      "items": ["功能介绍与引导"],
      "question": (
        "您好！我是您的 **Roam AI 智能旅行规划师与向导** ✈️\n\n"
        "我可以为您提供全方位、专业且高品质的全球深度旅行规划与实时咨询服务：\n\n"
        "🌟 **我能为您做的事情：**\n"
        "1. **全球任意目的地深度定制**：无论是新西兰自驾、日本关东关西漫游、欧洲阿尔卑斯雪山，还是国内各省风光，告诉我目的地与天数，即可为您量身定制完整方案并在右侧看板动态呈现。\n"
        "2. **智能时空动线规划**：科学安排每日上午、下午与晚间的游玩节奏，智能优化自驾车程与交通耗时。\n"
        "3. **必尝地道风物与特色美食**：精选当地特色美食、高分老店与品鉴指南，告别踩雷。\n"
        "4. **专业摄影机位与参数指导**：推荐绝佳出片机位，提供黄金拍摄时段（日出/日落/蓝调/星空）、推荐焦段与专业曝光参数。\n"
        "5. **实时路况与出行贴士**：结合权威指南知识库与全网即时检索，提醒路况、门票预约及出行实用注意事项。\n\n"
        "💡 **您可以这样告诉我：**\n"
        "- *“帮我规划新西兰南岛 7 天自驾与星空摄影”*\n"
        "- *“我想去东京 5 天深度游，喜欢地道美食和街头摄影”*\n"
        "- *“计划瑞士 8 天自由行，预算适中，节奏轻松”*\n\n"
        "请告诉我您的旅行目的地或想法，我们马上开始规划！"
      ),
    }

  # B. 纯问候语 (如 "你好", "hello", "hi", "在吗")
  greeting_triggers = ["你好", "您好", "hi", "hello", "嗨", "在吗", "早上好", "下午好", "晚上好"]
  if lower_input in greeting_triggers or (len(lower_input) <= 4 and any(g in lower_input for g in greeting_triggers)):
    return {
      "missing": True,
      "items": ["问候与引导"],
      "question": (
        "您好！很高兴为您服务！我是您的 **Roam AI 智能旅行向导**。\n\n"
        "请告诉我您的旅行想法（如：想去的目的地、计划游玩天数、偏好自驾/摄影/美食或预算），我将为您定制专属的高品质行程方案！"
      ),
    }

  # C. 纯推荐灵感咨询 (如 "有什么好玩的", "推荐旅游", "推荐目的地")
  recommendation_triggers = ["推荐旅游", "有什么好玩的", "推荐几个地方", "推荐目的地", "适合去哪", "去哪好玩", "推荐旅行"]
  if any(t in lower_input for t in recommendation_triggers):
    return {
      "missing": True,
      "items": ["目的地推荐灵感"],
      "question": (
        "为您精选了当下最值得体验的高品质旅行目的地灵感：\n\n"
        "1. 🇳🇿 **新西兰南岛（纯净自驾与暗夜星空）**：特卡波湖星空、库克山冰川步道、皇后镇美食与极限运动。\n"
        "2. 🗼 **日本东京与京都（古韵神社与风味漫游）**：浅草寺、涩谷十字路口、京都岚山竹林与地道日料。\n"
        "3. 🇨🇭 **瑞士阿尔卑斯（雪山湖泊与全景列车）**：少女峰、马特洪峰倒影、因特拉肯湖畔漫步。\n"
        "4. 🇨🇳 **中国南方山水与秘境（喀斯特峰林与自然水墨）**：阳朔漓江倒影、贵州瀑布与川西雪山。\n\n"
        "您对哪个目的地或哪种玩法更感兴趣？告诉我您想去的地方和游玩天数，我马上为您生成专属行程！"
      ),
    }

  # 如果已经经历了 1 轮以上的追问或上下文已经较丰富，不再阻塞用户，直接进行推演规划
  if user_turns >= 1 or len(full_context) >= 12:
    return {
      "missing": False,
      "items": [],
      "question": "",
    }

  # 1. 检查天数表达（支持数字、中文数字、星期、周等）
  day_keywords = ["天", "日", "周", "星期", "week", "day", "night", "晚"]
  has_days = any(kw in full_context for kw in day_keywords)

  # 2. 检查目的地/诉求意向（支持全球任意国家、城市、景区）
  missing_items = []
  extremely_vague_triggers = ["帮我规划", "想去旅游", "定制旅行", "随便", "出发", "规划", "旅游", "旅行"]
  is_pure_vague = any(cleaned_input == v for v in extremely_vague_triggers) or len(cleaned_input) < 2
  
  if is_pure_vague and not has_days and len(full_context) < 6:
    missing_items.append("目的地偏好")

  question = ""
  if missing_items:
    question = (
      "好的，很高兴为您定制专属旅行路线！\n\n"
      "请告诉我：\n"
      "1. 您计划前往哪个目的地？（如新西兰、东京、瑞士、冰岛、贵州等）\n"
      "2. 预计旅行几天？\n"
      "3. 有哪些特别的偏好？（如自驾、风光摄影、地道美食、轻徒步等）\n\n"
      "告诉我您的想法，我将为您生成高度定制的专属规划方案！"
    )

  return {
    "missing": bool(missing_items),
    "items": missing_items,
    "question": question,
  }
