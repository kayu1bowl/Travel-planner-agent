import axios from 'axios';

// 优先对接 OpenClaw Agent 规范服务 (端口 8080)
const PRIMARY_API_URL = 'http://localhost:8080/api';
const FALLBACK_API_URL = 'http://localhost:8000/api/v1';

export async function fetchTravelPlan(query, conversationHistory = null) {
  // 1. 尝试调用 OpenClaw Agent 核心接口 (/api/plan)
  try {
    const response = await axios.post(`${PRIMARY_API_URL}/plan`, {
      query,
      conversation_history: conversationHistory
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 35000
    });
    return response.data;
  } catch (err8080) {
    console.warn("ℹ️ OpenClaw 8080 主接口未连接或超时，尝试 Fallback 模式...", err8080.message);

    // 2. 尝试调用 OpenClaw Mock 接口 (/api/plan/mock)
    try {
      const mockRes = await axios.post(`${PRIMARY_API_URL}/plan/mock`, {
        query
      }, { timeout: 4000 });
      return mockRes.data;
    } catch (errMock) {
      // 3. 尝试调用 8000 端口服务
      try {
        const res8000 = await axios.post(`${FALLBACK_API_URL}/plan`, {
          query
        }, { timeout: 5000 });
        return res8000.data;
      } catch (err8000) {
        console.warn("⚠️ 后端 API 连接提示 (启用客户端高保真 Agent 模拟引擎):", err8000.message);
        throw err8080;
      }
    }
  }
}
