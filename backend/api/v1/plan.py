"""
FastAPI Plan API 路由实现
"""

from fastapi import APIRouter, HTTPException
from backend.models.travel_schema import TravelPlanRequest, TravelPlanResponse
from backend.services.agent_router import AgentRouter

router = APIRouter(prefix="/plan", tags=["Travel Plan"])
agent_router = AgentRouter()


@router.post("", response_model=TravelPlanResponse)
async def create_travel_plan(request: TravelPlanRequest):
    """
    根据自然语言需求生成标准化 AI 旅游规划清单
    """
    if not request.query or not request.query.strip():
        raise HTTPException(status_code=400, detail="请输入您的旅游需求（如：想去新西兰自驾7天）")

    try:
        plan = agent_router.plan_trip(user_query=request.query, preferences=request.preferences)
        return plan
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent 处理出现异常: {str(e)}")
