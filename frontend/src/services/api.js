import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

export async function fetchTravelPlan(query, preferences = {}) {
  try {
    const response = await axios.post(`${API_BASE_URL}/plan`, {
      query,
      preferences
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 25000
    });
    return response.data;
  } catch (error) {
    console.warn("⚠️ 后端 API 连接提示 (启用客户端高保真 Agent 模拟引擎):", error.message);
    throw error;
  }
}
