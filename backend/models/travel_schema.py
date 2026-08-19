"""
智能旅游规划 Pydantic 数据模型与 JSON 结构约束
"""

from pydantic import BaseModel, Field
from typing import List, Optional


class DailyItinerary(BaseModel):
    day: int = Field(description="第几天，如 1")
    theme: str = Field(description="当日主题，如：基督城 ➔ 特卡波湖 (Lake Tekapo)")
    morning: str = Field(description="上午行程安排与打卡推荐")
    afternoon: str = Field(description="下午行程安排与交通/景点描述")
    evening: str = Field(description="晚上行程安排、夜游或餐饮推荐")
    transport: str = Field(description="交通建议与预估用时")
    tips: str = Field(description="贴心避坑提示或注意事项")


class MustVisitSpot(BaseModel):
    name: str = Field(description="景点或特色小吃名称")
    category: str = Field(description="分类：景点 / 特色小吃")
    rating: str = Field(default="5/5", description="推荐指数，如 5/5")
    highlight: str = Field(description="核心亮点与特色体验描述")
    address_or_area: str = Field(description="建议位置、区域或名店推荐")


class PhotoGuide(BaseModel):
    location: str = Field(description="机位或拍摄地点")
    best_time: str = Field(description="最佳拍摄时间（如：黄金时刻、蓝调时刻、深夜星空）")
    composition_tips: str = Field(description="构图与拍摄镜头/角度技巧")
    outfit_color: str = Field(description="穿搭建议与色彩调色灵感")


class TravelPlanResponse(BaseModel):
    title: str = Field(description="定制行程规划总标题")
    summary: str = Field(description="行程整体特色与概要描述")
    itineraries: List[DailyItinerary] = Field(description="每日行程表格数据明细")
    must_visit_spots: List[MustVisitSpot] = Field(description="必去景点与特色小吃清单")
    photo_guides: List[PhotoGuide] = Field(description="摄影机位与出片指南")
    data_sources: List[str] = Field(default_factory=list, description="数据来源标注（如：ChromaDB私有向量知识库、全网实时搜索）")


class TravelPlanRequest(BaseModel):
    query: str = Field(..., description="用户的自然语言旅游需求描述", example="想去新西兰南岛自驾7天，喜欢风光摄影与轻徒步")
    preferences: Optional[dict] = Field(default_factory=dict, description="可选扩展偏好设置")
