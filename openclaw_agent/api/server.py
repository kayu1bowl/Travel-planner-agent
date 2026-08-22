"""
FastAPI 服务 — 供孙同学的前端调用

启动方式:
  python -m openclaw_agent.api.server

API 文档（启动后自动生成）:
  http://localhost:8080/docs (Swagger UI)
  http://localhost:8080/redoc (ReDoc)
"""

import sys
from pathlib import Path

_project_root = Path(__file__).resolve().parents[2]
if str(_project_root) not in sys.path:
  sys.path.insert(0, str(_project_root))

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional

from openclaw_agent.config.agent_config import API_HOST, API_PORT, API_CORS_ORIGINS
from openclaw_agent.workflows.travel_planner import plan_trip

app = FastAPI(
  title="NZ Travel Planner API",
  description="新西兰旅行规划智能体 - 后端 API",
  version="1.0.0",
)

# CORS — 允许前端跨域访问
app.add_middleware(
  CORSMiddleware,
  allow_origins=API_CORS_ORIGINS.split(",") if API_CORS_ORIGINS != "*" else ["*"],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)


# ============================================================
# 请求/响应模型
# ============================================================

class PlanRequest(BaseModel):
  """前端发来的旅行规划请求"""
  query: str = Field(
    ...,
    description="用户的旅行需求描述，如「新西兰南岛14天自驾摄影之旅」",
    min_length=1,
    max_length=2000,
  )
  conversation_history: Optional[list[dict]] = Field(
    None,
    description="可选的历史对话记录，用于追问补全场景",
    examples=[None],
  )


class PlanResponse(BaseModel):
  """后端返回的旅行规划结果"""
  success: bool = Field(..., description="是否成功生成")
  plan: Optional[dict] = Field(
    None,
    description="结构化行程数据（成功时返回）",
  )
  error: Optional[str] = Field(
    None,
    description="错误信息（失败时返回）",
  )
  needs_more_info: bool = Field(
    False,
    description="是否需要用户补充信息",
  )
  follow_up_question: Optional[str] = Field(
    None,
    description="需要用户补充的问题",
  )


class StatusResponse(BaseModel):
  """系统状态"""
  status: str
  version: str
  config_warnings: list[str]


# ============================================================
# API 端点
# ============================================================

@app.get("/", tags=["系统"])
async def root():
  """根路径 — 健康检查"""
  return {
    "service": "NZ Travel Planner",
    "version": "1.0.0",
    "status": "running",
  }


@app.get("/api/status", response_model=StatusResponse, tags=["系统"])
async def get_status():
  """获取系统状态和配置检查"""
  from openclaw_agent.config.agent_config import validate as validate_config
  return StatusResponse(
    status="ok",
    version="1.0.0",
    config_warnings=validate_config(),
  )


import asyncio

@app.post("/api/plan", response_model=PlanResponse, tags=["旅行规划"])
async def create_plan(request: PlanRequest):
  """ 核心端点：根据用户需求生成旅行计划

  请求示例:
    {
      "query": "新西兰南岛14天自驾摄影，秋天去，预算2-3万"
    }

  返回说明:
    - success=true + plan!=null > 正常生成完成
    - success=true + needs_more_info=true > 需要用户补充信息，
     请前端展示 follow_up_question，等用户补充后再次调用此接口
    - success=false + error!=null > 系统错误
  """
  if not request.query or not request.query.strip():
    raise HTTPException(status_code=400, detail="query 不能为空")

  result = await asyncio.to_thread(
    plan_trip,
    user_input=request.query.strip(),
    conversation_history=request.conversation_history,
  )
  return PlanResponse(**result)



@app.post("/api/plan/mock", response_model=PlanResponse, tags=["旅行规划"])
async def create_mock_plan(request: PlanRequest):
  """ Mock 模式：不调外部大模型，直接由智能规则引擎返回结构化行程（供前端开发测试）
  """
  return PlanResponse(
    success=True,
    plan=_mock_plan(request.query),
    error=None,
    needs_more_info=False,
    follow_up_question=None,
  )


def _mock_plan(query: str = "") -> dict:
  """生成智能模拟行程数据（支持全球任意目的地）"""
  try:
    from backend.services.agent_router import AgentRouter
    from openclaw_agent.tools.format_output import format_trip_plan
    import json

    router = AgentRouter()
    fallback_res = router._generate_smart_fallback(query or "旅行规划", ["智能旅行规则推演引擎"])
    data_dict = fallback_res.dict() if hasattr(fallback_res, "dict") else fallback_res.model_dump()
    return format_trip_plan(json.dumps(data_dict, ensure_ascii=False))
  except Exception as ex:
    print(f"⚠️ [Mock Plan Error] {ex}")

  return {
    "summary": {
      "title": f"{query[:12] or '精选'} 深度定制旅行规划",
      "days": "5",
      "route": "经典地标 > 深度风光 > 特色风味 > 黄金机位 > 返程",
      "budget": "适中舒适",
    },
    "daily_plan": [
      {
        "day": 1,
        "title": "抵达基督城",
        "content": "抵达基督城，取车，入住酒店。调整时差。如有时间可游览基督城植物园或大教堂广场。",
      },
      {
        "day": 2,
        "title": "基督城 > 特卡波 (约3小时车程)",
        "content": "上午从基督城出发，驱车前往特卡波湖。下午游览好牧羊人教堂，傍晚拍摄湖景日落。夜间拍摄银河（4-9月最佳）。",
      },
      {
        "day": 3,
        "title": "特卡波 > 库克山 > 特卡波",
        "content": "全天库克山国家公园。推荐胡克谷徒步（Hooker Valley Track，约3小时往返）。傍晚返回特卡波。",
      },
      {
        "day": 4,
        "title": "特卡波 > 瓦纳卡 (约2小时车程)",
        "content": "上午出发前往瓦纳卡。下午游览瓦纳卡湖和「孤独的树」。傍晚在湖畔拍摄日落。",
      },
      {
        "day": 5,
        "title": "瓦纳卡 > 皇后镇 (约1小时车程)",
        "content": "上午出发前往皇后镇。下午乘坐天际缆车登顶，俯瞰瓦卡蒂普湖和卓越山脉。傍晚在山顶拍摄全景。",
      },
      {
        "day": 6,
        "title": "皇后镇 — 米尔福德峡湾一日游",
        "content": "全天米尔福德峡湾游船之旅。可选择巴士+游船套餐（含午餐）。沿途经过镜湖、荷马隧道等景点。",
      },
      {
        "day": 7,
        "title": "皇后镇 — 格伦诺基一日游",
        "content": "上午前往格伦诺基（指环王取景地），拍摄湖景与山脉。下午天堂镇探秘。傍晚返回皇后镇。",
      },
      {
        "day": 8,
        "title": "皇后镇自由活动 / 极限运动",
        "content": "可选活动：卡瓦劳大桥蹦极、沙特欧瓦河喷气快艇、高空跳伞、蒸汽船巡游。建议提前预订。",
      },
      {
        "day": 9,
        "title": "皇后镇 > 但尼丁 (约3.5小时车程)",
        "content": "上午出发，途经水果小镇克伦威尔（Cromwell）。下午抵达但尼丁，游览火车站、鲍德温街。",
      },
      {
        "day": 10,
        "title": "但尼丁 — 奥塔哥半岛",
        "content": "全天游览奥塔哥半岛。参观皇家信天翁中心、黄眼企鹅保护区。傍晚在隧道海滩拍摄日落。",
      },
      {
        "day": 11,
        "title": "但尼丁 > 奥马鲁 > 基督城 (约5小时车程)",
        "content": "上午出发，途经奥马鲁（Oamaru）观赏蓝企鹅归巢（傍晚）。之后返回基督城。",
      },
      {
        "day": 12,
        "title": "基督城 — 阿卡罗阿一日游 (约1.5小时车程)",
        "content": "全天阿卡罗阿（法国风情小镇）。推荐参加羊驼牧场参观或海豚巡游。傍晚返回基督城。",
      },
      {
        "day": 13,
        "title": "基督城自由活动 / 购物",
        "content": "基督城市区游览：植物园、纸板大教堂、New Regent Street。购买纪念品和伴手礼。",
      },
      {
        "day": 14,
        "title": "基督城返程",
        "content": "整理行装，前往基督城机场还车，返回国内。",
      },
    ],
    "tips": [
      "新西兰靠左行驶，中国驾照需翻译件或国际驾照认证",
      "10月至12月（春季）和3月至5月（秋季）是最佳旅行季节",
      "建议购买全险，南岛碎石路较多",
      "部分地区信号差，建议下载离线地图",
      "新西兰入境检疫严格，不要携带食物",
      "建议提前预订热门活动和住宿（尤其是皇后镇）",
    ],
    "raw_markdown": "",
  }


# ============================================================
# 启动
# ============================================================

if __name__ == "__main__":
  import uvicorn
  print(f"  NZ Travel Planner API")
  print(f"  http://{API_HOST}:{API_PORT}")
  print(f"  http://localhost:{API_PORT}/docs (Swagger)")
  print()
  uvicorn.run(app, host=API_HOST, port=API_PORT)
