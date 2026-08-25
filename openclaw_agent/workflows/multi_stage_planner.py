"""
OpenClaw Multi-Stage Agent Collaborative Planning Pipeline
多阶段 Agent 协同规划流水线

架构拆解：
  Stage 1: 路线架构 Agent (RouteArchitectAgent) - 构思宏观骨架与城市动线
  Stage 2: 时空动线精细化 Agent (TimelineDetailAgent) - 细化每日早中晚活动与交通耗时
  Stage 3: 风物摄影管家 Agent (ExperienceCuratorAgent) - 甄选当地特色美食与出片机位
  Stage 4: 视觉解析与组装 Agent (VisualGroundingAgent) - 注入维基检索词与生图Prompt并装配
"""

import os
import json
import re
import requests
import asyncio
from typing import List, Dict, Any, Optional, Callable

from openclaw_agent.config.agent_config import (
    LLM_API_BASE,
    LLM_API_KEY,
    LLM_MODEL,
    LLM_EXTENDED_THINKING,
)


def _clean_and_parse_json(text: str) -> Optional[dict]:
    """清洗大模型输出并反序列化为 JSON 字典"""
    if not text:
        return None
    
    # 过滤 <think> 标签
    cleaned = re.sub(r'<think>[\s\S]*?</think>', '', text).strip()
    
    # 提取 Markdown 代码块
    if "```json" in cleaned:
        cleaned = cleaned.split("```json")[1].split("```")[0].strip()
    elif "```" in cleaned:
        cleaned = cleaned.split("```")[1].split("```")[0].strip()
    elif "{" in cleaned:
        m = re.search(r'(\{[\s\S]*\})', cleaned)
        if m:
            cleaned = m.group(1).strip()
            
    try:
        return json.loads(cleaned)
    except Exception:
        # 尝试常见结构闭合
        for suffix in ['"}', '"]}', '}]}', '"}]}', '"}\n}', '"]}\n}', '}]']:
            try:
                return json.loads(cleaned + suffix)
            except Exception:
                continue
    return None


def call_llm_json(prompt: str, system_prompt: str, timeout: float = 120.0) -> Optional[dict]:
    """底层快速单次 LLM JSON 调用"""
    headers = {
        "Authorization": f"Bearer {LLM_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": LLM_MODEL or "gemini-3.7-flash",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.6,
        "extended_thinking": LLM_EXTENDED_THINKING
    }
    try:
        resp = requests.post(
            f"{LLM_API_BASE}/chat/completions",
            headers=headers,
            json=payload,
            timeout=timeout,
            allow_redirects=True
        )
        if resp.status_code == 200:
            content = resp.json()["choices"][0]["message"]["content"]
            return _clean_and_parse_json(content)
        else:
            print(f"⚠️ [MultiStage LLM] HTTP {resp.status_code}: {resp.text[:100]}")
    except Exception as e:
        print(f"⚠️ [MultiStage LLM] 请求异常: {e}")
    return None


# =========================================================================
# Stage 1: 路线架构 Agent (Route Architect Agent)
# =========================================================================
class RouteArchitectAgent:
    """负责从自然语言中识别目的地、天数、主题偏好，构思宏观路线与每日核心城市跃迁"""

    SYSTEM_PROMPT = """你是一个资深旅行总设计师。你的任务是分析用户的自然语言旅行需求，构建行程的宏观架构大纲。
必须优先遵循参考资料中的私有知识库事实与权威指南。
必须输出严格合法的 JSON 格式：
{
  "title": "极具吸引力的行程总标题（包含目的地与天数，如：北海道5天极致自然风光与雪山湖泊之旅）",
  "summary": "100字左右的行程亮点概述与适合人群",
  "destination": "核心目的地（如：日本北海道 / 新西兰南岛 / 瑞士阿尔卑斯 / 新疆伊犁）",
  "days_count": 5,
  "daily_skeletons": [
    {
      "day": 1,
      "theme": "当日主题路线（如：抵达札幌 ➔ 支笏湖火山湖 ➔ 小樽运河夜色）",
      "anchor_cities": ["札幌", "小樽"]
    }
  ]
}
注意：只输出合法 JSON，不要任何多余解释。"""

    @classmethod
    def run(cls, user_query: str, context: str = "") -> Optional[dict]:
        prompt = f"用户旅行需求：{user_query}\n\n参考资料（优先结合私有知识库）：\n{context}\n\n请构思宏观路线骨架大纲。"
        return call_llm_json(prompt, cls.SYSTEM_PROMPT, timeout=90.0)


# =========================================================================
# Stage 2: 时空动线精细化 Agent (Timeline Detail Agent)
# =========================================================================
class TimelineDetailAgent:
    """负责接收宏观骨架，深入拆解每日上午/下午/晚间的活动节奏、交通耗时与避坑贴士"""

    SYSTEM_PROMPT = """你是一个高精度时空动线规划师。根据给定的行程骨架与参考资料，将每一天细化为上午、下午、晚间的具体打卡节点、交通耗时与避坑贴士。
注意：
1. 优先采用参考资料（知识库事实与真实路况）中的具体国道公路、步道名称、自驾/JR耗时与交通准则。
2. 必须输出严格合法的 JSON 格式：
{
  "itineraries": [
    {
      "day": 1,
      "theme": "当日主题",
      "morning": "上午具体的景点体验与打卡细节",
      "afternoon": "下午的深入游览与活动",
      "evening": "晚上的特色餐饮、夜景或住宿体验",
      "transport": "具体交通方式与预估耗时（如：JR快速约35分钟 / 租车自驾SH8国道约2.5小时）",
      "tips": "极具参考价值的避坑贴士或官方安全准则"
    }
  ]
}
注意：只输出合法 JSON，内容要具体详实，杜绝空话。"""

    @classmethod
    def run(cls, user_query: str, architecture: dict, context: str = "") -> Optional[dict]:
        skeletons_str = json.dumps(architecture.get("daily_skeletons", []), ensure_ascii=False, indent=2)
        prompt = f"""用户原始需求：{user_query}
行程标题：{architecture.get('title')}
目的地：{architecture.get('destination')}，天数：{architecture.get('days_count')}天

已确定的每日宏观大纲：
{skeletons_str}

参考资料（含知识库权威事实与实用路况）：
{context}

请将上述大纲逐日细化为高质量的每日行程。"""
        return call_llm_json(prompt, cls.SYSTEM_PROMPT, timeout=120.0)


# =========================================================================
# Stage 3: 风物美食与摄影机位 Agent (Experience Curator Agent)
# =========================================================================
class ExperienceCuratorAgent:
    """负责结合途经目的地，精选必吃特色美食名店与绝美摄影机位参数"""

    SYSTEM_PROMPT = """你是一个全球旅行美食鉴赏家兼风光摄影导师。根据给定的目的地与路线，甄选地道特色美食与专业出片摄影机位。
注意：
1. 优先融合参考资料（知识库事实与当地权威榜单）中推荐的特色名吃（如高山冷水三文鱼、特色肉派、汤咖喱等）与黄金拍摄机位参数。
2. 必须输出严格合法的 JSON 格式：
{
  "must_visit_spots": [
    {
      "name": "地标或特色风味名称（如：好牧羊人教堂 / 普卡基湖高山冷水三文鱼）",
      "category": "经典地标 或 地道美食",
      "rating": "5/5",
      "highlight": "核心亮点与推荐理由",
      "address_or_area": "位置区域或知名老店推荐"
    }
  ],
  "photo_guides": [
    {
      "location": "摄影机位名称（如：好牧羊人教堂暗夜星空拱桥）",
      "best_time": "最佳拍摄时间（如：银河季 4-9 月 22:00-03:00 / 蓝调时刻 18:00-19:00）",
      "composition_tips": "专业构图镜头技巧（如：超广角低机位仰拍纳入教堂剪影与银河拱桥）",
      "camera_params": "推荐焦段与曝光参数（如：14-24mm · f/2.8 · 15-20s · ISO 3200-6400）",
      "outfit_color": "推荐穿搭与色彩搭配灵感"
    }
  ]
}
注意：只输出合法 JSON，推荐 4~6 个代表性地标/美食，以及 3~4 个专业摄影机位。"""

    @classmethod
    def run(cls, user_query: str, architecture: dict, context: str = "") -> Optional[dict]:
        prompt = f"""用户需求：{user_query}
目的地：{architecture.get('destination')}
标题：{architecture.get('title')}
每日主要途经点：{json.dumps(architecture.get('daily_skeletons', []), ensure_ascii=False)}

参考资料（含知识库机位指南与美食风味）：
{context}

请为该行程甄选当地口碑必去景点、特色美食名吃以及专业级摄影机位指南。"""
        return call_llm_json(prompt, cls.SYSTEM_PROMPT, timeout=120.0)


# =========================================================================
# Stage 4: 视觉解析与数据装配 Agent (Visual Grounding Agent)
# =========================================================================
class VisualGroundingAgent:
    """负责为所有地标/美食并发检索真实全网影像与生成视觉元数据，并组装为完整方案"""

    @classmethod
    def assemble(
        cls, 
        architecture: dict, 
        timeline_data: dict, 
        experience_data: dict,
        data_sources: List[str]
    ) -> dict:
        itineraries = timeline_data.get("itineraries", [])
        must_visit_spots = experience_data.get("must_visit_spots", [])
        photo_guides = experience_data.get("photo_guides", [])
        destination = architecture.get("destination", "")

        # 实时并发检索全网开放实拍图与 AI 生成
        try:
            from openclaw_agent.tools.universal_image_search import batch_resolve_images
            print(f"📸 [VisualGroundingAgent] 正在为全球地标与风味并发检索实拍照片: {len(must_visit_spots)} 处景点, {len(photo_guides)} 处机位...")
            must_visit_spots = batch_resolve_images(must_visit_spots, destination)
            photo_guides = batch_resolve_images(photo_guides, destination)
        except Exception as img_err:
            print(f"⚠️ [VisualGroundingAgent] 全网图片检索降级: {img_err}")

        # 为摄影机位生成生图与维基标签
        for pg in photo_guides:
            loc = pg.get("location", "")
            if not pg.get("wiki_keyword"):
                pg["wiki_keyword"] = re.sub(r'[(（].*?[)）]', '', loc).strip()
            if not pg.get("ai_prompt"):
                pg["ai_prompt"] = f"Breathtaking scenery photography of {loc}, golden hour light, National Geographic style, 8k"

        # 为必去地标/美食生成标签
        for spot in must_visit_spots:
            name = spot.get("name", "")
            if not spot.get("wiki_keyword"):
                spot["wiki_keyword"] = re.sub(r'[(（].*?[)）]', '', name).strip()

        # 生成与经典 API 规范 (frontend_api.md) 完全兼容的结构
        daily_plan = []
        collected_tips = []
        md_lines = [
            f"# {architecture.get('title', '定制旅行方案')}\n",
            f"> **行程天数**：{len(itineraries)} 天 | **目的地**：{destination}\n",
            f"{architecture.get('summary', '')}\n",
            "## 📅 每日详细行程\n"
        ]

        for idx, itin in enumerate(itineraries):
            d_num = itin.get("day", idx + 1)
            d_title = itin.get("theme", f"Day {d_num}")
            morning = itin.get("morning", "")
            afternoon = itin.get("afternoon", "")
            evening = itin.get("evening", "")
            transport = itin.get("transport", "")
            tip = itin.get("tips", "")

            content_parts = []
            if morning: content_parts.append(f"【上午】{morning}")
            if afternoon: content_parts.append(f"【下午】{afternoon}")
            if evening: content_parts.append(f"【晚上】{evening}")
            if transport: content_parts.append(f"【交通】{transport}")
            if tip: 
                content_parts.append(f"【贴士】{tip}")
                collected_tips.append(tip)

            daily_plan.append({
                "day": d_num,
                "title": d_title,
                "content": "\n".join(content_parts)
            })

            md_lines.append(f"### Day {d_num}: {d_title}")
            for cp in content_parts:
                md_lines.append(f"- {cp}")
            md_lines.append("")

        if must_visit_spots:
            md_lines.append("## 🍜 必打卡地标与地道风味")
            for s in must_visit_spots:
                highlight = s.get("highlight", "")
                md_lines.append(f"- **{s.get('name', '')}** ({s.get('category', '经典')})：{highlight}")
                if highlight:
                    collected_tips.append(f"【{s.get('name', '')}】{highlight}")
            md_lines.append("")

        if photo_guides:
            md_lines.append("## 📸 专业摄影机位指南")
            for p in photo_guides:
                loc = p.get("location", "")
                tips_p = p.get("composition_tips", "")
                timing = p.get("best_time", "")
                params = p.get("camera_params", "")
                md_lines.append(f"- **{loc}**（{timing}）：{tips_p} | 参数：`{params}`")
                if tips_p:
                    collected_tips.append(f"【机位-{loc}】{tips_p}")
            md_lines.append("")

        raw_markdown = "\n".join(md_lines)

        return {
            "title": architecture.get("title", "定制旅行方案"),
            "summary": {
                "title": architecture.get("title", "定制旅行方案"),
                "days": str(len(itineraries)),
                "route": architecture.get("summary", ""),
                "budget": "适中舒适"
            },
            "destination": destination,
            "days_count": len(itineraries) if itineraries else architecture.get("days_count", 5),
            "itineraries": itineraries,
            "daily_plan": daily_plan,
            "tips": collected_tips or ["行前请检查当地天气与交通准则", "建议购买旅行全险并随身携带证件"],
            "must_visit_spots": must_visit_spots,
            "photo_guides": photo_guides,
            "raw_markdown": raw_markdown,
            "data_sources": data_sources or ["OpenClaw Multi-Stage Agent Pipeline", "全网旅行实时搜索"],
            "needs_more_info": False,
            "follow_up_question": None
        }


# =========================================================================
# Multi-Stage Master Pipeline Controller
# =========================================================================
def run_multi_stage_pipeline(
    user_query: str, 
    context: str = "", 
    data_sources: List[str] = None,
    progress_callback: Optional[Callable[[str, int], None]] = None
) -> Optional[dict]:
    """
    运行 OpenClaw 4 阶段 Agent 协同流水线
    
    Args:
        user_query: 用户输入的自然语言需求
        context: 检索到的 RAG / Web 知识
        data_sources: 信源列表
        progress_callback: 进度回调函数 fn(step_text, step_index)
    """
    sources = list(data_sources or [])
    
    # -------------------------------------------------------------
    # Stage 1: 路线架构 Agent
    # -------------------------------------------------------------
    if progress_callback:
        progress_callback("正在构思行程宏观架构与城市动线...", 1)
    print("🚀 [Stage 1/4] RouteArchitectAgent 正在构思宏观路线骨架...")
    
    arch = RouteArchitectAgent.run(user_query, context)
    if not arch or not arch.get("title"):
        print("⚠️ [Stage 1] 架构构思未完成，尝试重试...")
        arch = RouteArchitectAgent.run(user_query, context)
        if not arch:
            print("❌ [Stage 1] 架构解析失败，交由底层兜底")
            return None

    print(f"✅ [Stage 1/4] 架构确定: {arch.get('title')} ({arch.get('days_count')}天)")

    # -------------------------------------------------------------
    # Stage 2 & Stage 3: 时空动线精细化 + 美食摄影甄选 (多任务协同)
    # -------------------------------------------------------------
    if progress_callback:
        progress_callback("正在精细化每日上午/下午时空动线与交通耗时...", 2)
    print("🚀 [Stage 2/4] TimelineDetailAgent 正在细化每日行程与交通...")
    timeline_res = TimelineDetailAgent.run(user_query, arch, context)
    if not timeline_res or not timeline_res.get("itineraries"):
        print("⚠️ [Stage 2] 行程细化重试中...")
        timeline_res = TimelineDetailAgent.run(user_query, arch, context) or {"itineraries": []}

    if progress_callback:
        progress_callback("正在甄选当地口碑美食名店与绝美摄影机位...", 3)
    print("🚀 [Stage 3/4] ExperienceCuratorAgent 正在甄选必吃风味与出片机位...")
    exp_res = ExperienceCuratorAgent.run(user_query, arch, context) or {"must_visit_spots": [], "photo_guides": []}

    # -------------------------------------------------------------
    # Stage 4: 视觉解析与数据装配
    # -------------------------------------------------------------
    if progress_callback:
        progress_callback("正在匹配全球实拍图库与视觉渲染...", 4)
    print("🚀 [Stage 4/4] VisualGroundingAgent 正在注入视觉检索标签并组装...")
    
    sources.append("OpenClaw Multi-Stage Agent Pipeline (Gemini 3.7)")
    final_plan = VisualGroundingAgent.assemble(arch, timeline_res, exp_res, sources)
    print(f"🌟 [MultiStage Pipeline] 全流程协同完成！总天数: {len(final_plan.get('itineraries', []))} 天")
    return final_plan
