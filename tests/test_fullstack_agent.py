"""
全栈 Agent 智能路线生成与 API 自动化测试
"""

import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from fastapi.testclient import TestClient
from backend.main import app
from backend.services.agent_router import AgentRouter

client = TestClient(app)


def test_agent_router_direct():
    """测试 AgentRouter 本地方案生成能力"""
    router = AgentRouter()
    plan = router.plan_trip("想去新西兰自驾7天，包含风光摄影")
    assert plan.title is not None
    assert len(plan.itineraries) > 0
    assert len(plan.must_visit_spots) > 0
    assert len(plan.photo_guides) > 0
    print("✅ AgentRouter 直接调度测试通过!")


def test_api_plan_endpoint():
    """测试 FastAPI /api/v1/plan HTTP 接口"""
    payload = {
        "query": "贵州5天美食与自然风光游"
    }
    response = client.post("/api/v1/plan", json=payload)
    if response.status_code != 200:
        print(f"API Error ({response.status_code}):", response.text)
    assert response.status_code == 200
    data = response.json()
    assert "title" in data
    assert "itineraries" in data
    assert "must_visit_spots" in data
    assert "photo_guides" in data
    print("✅ FastAPI /api/v1/plan 接口 HTTP 测试通过!")


if __name__ == "__main__":
    test_agent_router_direct()
    test_api_plan_endpoint()
    print("🎉 所有后端自动化测试均已成功通过！")
