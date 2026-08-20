# 🐱 NZ Travel Planner — 前端接口规范

> 给孙同学的前端开发参考文档
>
> 后端服务地址: `http://<服务器IP>:8080`
> (启动方式见文末)
>
> 所有接口返回 JSON。

---

## 📋 接口一览

| 端点 | 方法 | 用途 | Demo 可用 |
|:----|:----|:----|:---------:|
| `/` | GET | 健康检查 | ✅ |
| `/api/status` | GET | 获取系统状态 | ✅ |
| `/api/plan` | POST | **生成旅行计划** | ✅ (需 Key) |
| `/api/plan/mock` | POST | Mock 生成（开发用） | ✅ |

---

## 1️⃣ 健康检查

```
GET /
```

返回示例:
```json
{
  "service": "NZ Travel Planner",
  "version": "1.0.0",
  "status": "running"
}
```

---

## 2️⃣ 系统状态

```
GET /api/status
```

返回示例:
```json
{
  "status": "ok",
  "version": "1.0.0",
  "config_warnings": []
}
```

`config_warnings` 会列出缺少的配置项，如 LLM_API_KEY 未设置时:
```json
{
  "status": "ok",
  "version": "1.0.0",
  "config_warnings": ["LLM_API_KEY 未设置 — LLM 调用将失败"]
}
```

---

## 3️⃣ 🎯 生成旅行计划（核心接口）

```
POST /api/plan
Content-Type: application/json
```

### 请求体

```json
{
  "query": "新西兰南岛14天自驾摄影，秋天去，预算2-3万",
  "conversation_history": null
}
```

| 字段 | 类型 | 必填 | 说明 |
|:----|:----|:----|:----|
| `query` | string | ✅ | 用户的旅行需求，最长 2000 字 |
| `conversation_history` | array | ❌ | 历史对话（追问补全时使用） |

### 成功响应（有完整计划）

```json
{
  "success": true,
  "plan": {
    "summary": {
      "title": "新西兰南岛14天秋季自驾摄影之旅",
      "days": "14",
      "route": "基督城 → 特卡波 → 瓦纳卡 → 皇后镇 → 但尼丁 → 基督城",
      "budget": "约 25,000 - 35,000 人民币/人（不含国际机票）"
    },
    "daily_plan": [
      {
        "day": 1,
        "title": "抵达基督城",
        "content": "抵达基督城，取车，入住酒店..."
      },
      {
        "day": 2,
        "title": "基督城 → 特卡波 (约3小时车程)",
        "content": "上午从基督城出发..."
      }
    ],
    "tips": [
      "新西兰靠左行驶，中国驾照需翻译件",
      "建议购买全险，南岛碎石路较多",
      "部分地区信号差，建议下载离线地图"
    ],
    "raw_markdown": "## 行程概览\n..."
  },
  "error": null,
  "needs_more_info": false,
  "follow_up_question": null
}
```

### 需要补充信息（追问模式）

当用户输入信息不完整时:

```json
{
  "success": true,
  "plan": null,
  "error": null,
  "needs_more_info": true,
  "follow_up_question": "你计划玩几天？想去新西兰的哪些地方？有什么特别的兴趣吗？"
}
```

> **前端处理逻辑:**
> - `needs_more_info=true` → 显示 `follow_up_question`，让用户输入
> - 用户回复后再次调用 `/api/plan`，把新对话传入 `conversation_history`

### 失败响应

```json
{
  "success": false,
  "plan": null,
  "error": "配置不完整: LLM_API_KEY 未设置 — LLM 调用将失败",
  "needs_more_info": false,
  "follow_up_question": null
}
```

---

## 4️⃣ 🎭 Mock 模式（前端开发专用）

```
POST /api/plan/mock
Content-Type: application/json
```

请求体格式与 `/api/plan` 完全相同，但**不调用 LLM**，直接返回模拟数据。

**用途:**
- 前端开发阶段，无需后端配置任何 API Key
- 测试 UI 渲染、Markdown 展示、导出功能
- 后端配置完成后无缝切换到真实接口

请求示例:
```json
{
  "query": "随便什么内容"
}
```

返回格式与 `/api/plan` 完全一致。

---

## 🎨 前端 UI 建议

### 主界面布局

```
┌──────────────────────────────────┐
│  🐱 NZ Travel Planner           │
├──────────────────────────────────┤
│                                  │
│  ┌──────────────────────────┐   │
│  │ 输入你的旅行需求...       │   │
│  └──────────────────────────┘   │
│  [🚀 生成行程]                  │
│                                  │
│  ┌─ 行程概览 ─────────────────┐ │
│  │ 📍 天数: 14天              │ │
│  │ 🗺️ 路线: 基督城→皇后镇... │ │
│  │ 💰 预算: 2.5-3.5万        │ │
│  └────────────────────────────┘ │
│                                  │
│  ┌─ 每日行程 ─────────────────┐ │
│  │ Day 1 📅                    │ │
│  │ 抵达基督城...               │ │
│  │ ──────                      │ │
│  │ Day 2 📅                    │ │
│  │ 基督城→特卡波...            │ │
│  └────────────────────────────┘ │
│                                  │
│  ┌─ 实用贴士 ─────────────────┐ │
│  │ 💡 靠左行驶...             │ │
│  │ 💡 购买全险...             │ │
│  └────────────────────────────┘ │
│                                  │
│  [📥 导出 Markdown]  [🔄 重新] │
│                                  │
└──────────────────────────────────┘
```

### 追问模式（缺信息时）

```
┌──────────────────────────────────┐
│  🤔 需要更多信息                │
│                                  │
│  你计划玩几天？想去哪里？       │
│                                  │
│  ┌──────────────────────────┐   │
│  │ 14天，南岛自驾...        │   │
│  └──────────────────────────┘   │
│  [继续]                         │
└──────────────────────────────────┘
```

### 推荐技术栈

| 组件 | 推荐 |
|:----|:----|
| 框架 | React + Vite 或 Vue3 + Vite |
| 样式 | Tailwind CSS |
| Markdown | react-markdown / marked.js |
| HTTP | axios / fetch |
| 导出 | marked.js + FileSaver.js (Markdown 导出) |

### 前端需要处理的状态

```
IDLE        → 初始状态，等待用户输入
LOADING     → 正在生成行程（显示加载动画）
RESULT      → 有行程结果
MORE_INFO   → 需要用户补充信息
ERROR       → 出错提示
```

---

## 🚀 后端启动方式

```bash
# 1. 配置环境变量（创建 .env 文件或 export）
export LLM_API_KEY="sk-your-api-key"
export LLM_API_BASE="https://api.deepseek.com/v1"
export LLM_MODEL="deepseek-chat"
export WEB_SEARCH_BACKEND="mock"   # 开发阶段先用 mock

# 2. 安装依赖
pip install -r requirements.txt
pip install fastapi uvicorn

# 3. 启动后端
python -m openclaw_agent.api.server

# 终端输出:
#   🐱 NZ Travel Planner API
#   📡 http://0.0.0.0:8080
#   📖 http://localhost:8080/docs (Swagger)
```

> **前端代码中后端地址:**
> 开发阶段请配置 API_BASE_URL，可手动切换 mock/真实模式:
> ```javascript
> const API_BASE = 'http://localhost:8080';
> const USE_MOCK = true;  // 开发阶段 true，上线后 false
> ```

---

## 📐 数据流图

```
用户输入
   │
   ▼
┌─────────────┐     ┌──────────────┐
│  前端 UI     │────▶│  /api/plan   │
│  (React/Vue) │     │  FastAPI     │
└─────────────┘     └──────┬───────┘
      ▲                    │
      │                    ▼
      │           ┌────────────────┐
      │           │ travel_planner │
      │           │  主流程        │
      │           └────┬──────┬────┘
      │                │      │
      │                ▼      ▼
      │         ┌──────┐  ┌──────┐
      │         │ RAG  │  │ Web  │
      │         │ 检索  │  │ 搜索  │
      │         └──────┘  └──────┘
      │                │
      │                ▼
      │         ┌──────────────┐
      │         │ LLM 生成     │
      │         │ (DeepSeek等) │
      │         └──────┬───────┘
      │                │
      └────────────────┘
         返回结构化JSON
```
