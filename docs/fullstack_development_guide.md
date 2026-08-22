# 智能旅游规划 AI 应用 — 全栈开发操作指南与实施文档

本文档为“智能旅游规划 AI 应用”的前后端自研开发指南，涵盖项目整体架构、后端 FastAPI 与 Agent 调度逻辑实现、本地 ChromaDB RAG 数据构建、前端 React/Vite 交互与标准化清单渲染，以及本地联调与验证规范。

---

## 目录
1. [项目全局架构与技术选型](#一项目全局架构与技术选型)
2. [数据层与 RAG 本地知识库准备 SOP](#二数据层与-rag-本地知识库准备-sop)
3. [后端开发指南 (FastAPI & Agent Logic)](#三后端开发指南-fastapi--agent-logic)
4. [前端开发指南 (React Web)](#四前端开发指南-react-web)
5. [标准化接口规范 (API Spec)](#五标准化接口规范-api-spec)
6. [本地部署、联调与测试验证](#六本地部署联调与测试验证)
7. [Git 提交与团队协作规范](#七git-提交与团队协作规范)

---

## 一、项目全局架构与技术选型

### 1.1 系统架构图

```
                       ┌──────────────────────────────────────┐
                       │           用户自然语言输入           │
                       └──────────────────┬───────────────────┘
                                          │ (HTTP / SSE)
                                          ▼
                       ┌──────────────────────────────────────┐
                       │       FastAPI 后端 API 服务层        │
                       └──────────────────┬───────────────────┘
                                          │
                                          ▼
                       ┌──────────────────────────────────────┐
                       │     Agent 智能路由与决策调度核心     │
                       └─────────┬──────────────────┬─────────┘
                                 │                  │
                ┌────────────────┴─┐              ┌─┴────────────────┐
                │ 意图判定: 私有知识 │              │ 意图判定: 实时信息│
                └────────┬─────────┘              └─┬────────────────┘
                         ▼                                  ▼
           ┌──────────────────────────┐        ┌──────────────────────────┐
           │ ChromaDB 本地向量数据库  │        │   全网实时搜索 API       │
           │ (LlamaIndex + BAAI/bge-m3)│        │  (SerpAPI/Tavily/Crawl) │
           └────────────┬─────────────┘        └────────────┬─────────────┘
                        │                                   │
                        └─────────────────┬─────────────────┘
                                          │ (合并 Context & 结构化 Prompt)
                                          ▼
                       ┌──────────────────────────────────────┐
                       │   大语言模型 (LLM) 强制 JSON 格式化   │
                       └──────────────────┬───────────────────┘
                                          │
                                          ▼
                       ┌──────────────────────────────────────┐
                       │  前端 React 标准化渲染与交互 (Web)   │
                       │  (行程表格 + 必去/美食 + 摄影建议)   │
                       └──────────────────────────────────────┘
```

### 1.2 技术选型表

| 模块 | 技术栈 / 依赖 | 说明 |
| :--- | :--- | :--- |
| **前端 (Frontend)** | React 18 + Vite + Tailwind CSS / Vanilla CSS | 页面开发快、组件化强、无原生小程序限制 |
| **后端 (Backend)** | Python 3.10+ + FastAPI + Pydantic + Uvicorn | 高性能异步 API，原生支持 Pydantic 校验与 SSE 流式响应 |
| **向量数据库 (Vector DB)** | ChromaDB (本地持久化 `rag-knowledge-base/chroma_db`) | 开源、免费、无需部署外部数据库服务 |
| **Embedding 模型** | `BAAI/bge-m3` | 强大的中英文及多语言嵌入模型 |
| **RAG 框架** | LlamaIndex (`llama-index-core`, `llama-index-vector-stores-chroma`) | 提供完备的 Node Splitter、Storage Context 与 Retriever |
| **联网搜索 (Web Search)** | Tavily API / SerpAPI / Crawl4AI | 补充实时天气、最新交通路线、最新门票价格与突发资讯 |

---

## 二、数据层与 RAG 本地知识库准备 SOP

### 2.1 资料收集与放置规范
严格遵循项目 `rag-knowledge-base/data/raw/raw_readme.md` 规范：
* **文件存储路径**：`rag-knowledge-base/data/raw/{continent}/{country}/{province}/{travel_type}/`
* **文件格式**：支持 `.pdf`、`.txt`、`.md`
* **命名规范**：`{地区简写}_{主题}.txt`（例如 `guizhou_drive.txt`、`nz_photo.txt`）

### 2.2 构建向量索引步骤
在根目录下运行离线构建脚本：
```bash
python -m rag-knowledge-base.builder
```
构建过程说明：
1. 自动对 `rag-knowledge-base/data/raw/` 目录进行递归扫描。
2. 使用 `SentenceSplitter(chunk_size=512, chunk_overlap=128)` 划分 Chunk。
3. 调用 `BAAI/bge-m3` 计算 Embedding。
4. 持久化保存至 `rag-knowledge-base/chroma_db/`。

---

## 三、后端开发指南 (FastAPI & Agent Logic)

后端新增核心目录 `backend/`：
```
backend/
├── main.py                   # FastAPI 入口与路由注册
├── config.py                 # 后端环境变量与密钥配置
├── models/                   # Pydantic 结构化响应数据模型
│   └── travel_schema.py
├── services/                 # 业务逻辑服务
│   ├── rag_service.py        # ChromaDB 向量检索服务
│   ├── search_service.py     # 联网搜索服务
│   └── agent_router.py       # 智能体路由决策核心
└── api/                      # API 路由接口
    └── v1/
        └── plan.py
```

### 3.1 核心组件设计

#### 1. 结构化数据模型 (`backend/models/travel_schema.py`)
```python
from pydantic import BaseModel, Field
from typing import List, Optional

class DailyItinerary(BaseModel):
    day: int = Field(description="第几天，如 1")
    theme: str = Field(description="当日主题，如：贵阳市区古风与美食漫游")
    morning: str = Field(description="上午行程安排")
    afternoon: str = Field(description="下午行程安排")
    evening: str = Field(description="晚上行程安排")
    transport: str = Field(description="交通建议")
    tips: str = Field(description="贴心避坑提示")

class MustVisitSpot(BaseModel):
    name: str = Field(description="景点/特色小吃名称")
    category: str = Field(description="分类：景点 / 特色小吃")
    rating: str = Field(description="推荐指数，如 5/5")
    highlight: str = Field(description="核心亮点/推荐理由")
    address_or_area: str = Field(description="建议位置或区域")

class PhotoGuide(BaseModel):
    location: str = Field(description="机位/拍摄地点")
    best_time: str = Field(description="最佳拍摄时间（如日出、黄昏蓝调时刻）")
    composition_tips: str = Field(description="构图与拍摄技巧")
    outfit_color: str = Field(description="穿搭与调色建议")

class TravelPlanResponse(BaseModel):
    title: str = Field(description="行程规划总标题")
    summary: str = Field(description="行程概述与特色亮点")
    itineraries: List[DailyItinerary] = Field(description="每日行程表格数据")
    must_visit_spots: List[MustVisitSpot] = Field(description="必去景点与特色小吃清单")
    photo_guides: List[PhotoGuide] = Field(description="摄影机位与出片建议")
    data_sources: List[str] = Field(description="数据来源标注（如：本地私有知识库、全网实时搜索）")
```

#### 2. Agent 路由与动态决策 (`backend/services/agent_router.py`)
* **决策算法**：
  1. 接收用户 User Prompt。
  2. 调用 `RAGService.search(query, top_k=3)` 获取相关得分。
  3. **判定依据**：
     * 若最高相似度分值高于阈值 `0.65` 且非实时敏感问题 -> **优先采用本地 RAG 库上下文**。
     * 若提及实时时效性词汇（如“今天天气”、“最新门票”、“实时交通”）或向量匹配度低于阈值 -> **触发 WebSearchService 联网补全**。
     * **混合策略**：在私有资料基础上叠加联网实时数据，确保既有深度的私有专业攻略（机位/路线），又有最新的实时资讯。

---

## 四、前端开发指南 (React Web)

前端项目目录 `frontend/`：
```
frontend/
├── index.html
├── package.json
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── App.css
│   ├── components/
│   │   ├── Header.jsx           # 导航与系统状态
│   │   ├── InputForm.jsx        # 自然语言输入与快捷 Tag
│   │   ├── AgentStatus.jsx      # Agent 思考与调度进度展示
│   │   ├── PlanDisplay.jsx      # 方案整体外壳与 Markdown 导出
│   │   ├── ItineraryTable.jsx   # 每日行程标准化表格
│   │   ├── MustVisitList.jsx    # 必去景点与小吃清单
│   │   └── PhotoGuideCard.jsx   # 摄影建议与卡片
│   └── services/
│       └── api.js               # API 请求封装
```

### 4.1 UI 交互与渲染设计
1. **自然语言输入区**：
   * 大尺寸现代搜索框，提供提示词模板（例：“新西兰南岛 8 天自驾与风光摄影”，“贵州 5 天吃货与民族风情游”）。
2. **Agent 执行状态反馈 (Agent Status Overlay)**：
   * 在生成过程中实时展示动态 Status，提升用户等待体验（例如：`🔍 正在检索本地 ChromaDB 私有知识库...` -> `🌐 联网补全实时天气与景点信息...` -> `✨ 正在生成标准化行程清单...`）。
3. **标准化结果展示三核心卡片**：
   * **行程规划表 (`ItineraryTable.jsx`)**：采用极简高对比度表格，逐天列明 上午/下午/晚上/交通/Tips。
   * **必去景点与美食清单 (`MustVisitList.jsx`)**：网格化 Tag 卡片展示，附带推荐指数与避坑提醒。
   * **摄影与出片指南 (`PhotoGuideCard.jsx`)**：相机图标 + 构图提示 + 最佳时间点标签（黄金时刻/蓝调时刻）。

---

## 五、标准化接口规范 (API Spec)

### 5.1 POST `/api/v1/plan`
* **Request Body**:
```json
{
  "query": "想去新西兰南岛自驾7天，喜欢摄影和轻徒步，求规划清单",
  "preferences": {
    "days": 7,
    "style": "photography"
  }
}
```

* **Response Body** (遵守 `TravelPlanResponse` 模式):
```json
{
  "title": "新西兰南岛 7 天绝美风光与摄影自驾之旅",
  "summary": "本方案融合本地私有自驾攻略与实时天气路线，专为摄影爱好者与自然探索者定制。",
  "itineraries": [
    {
      "day": 1,
      "theme": "基督城 ➔ 特卡波湖 (Lake Tekapo)",
      "morning": "基督城取车，前往超市采购补给。",
      "afternoon": "沿 State Highway 1 驱车前往 Lake Tekapo，途中在 Fairlie 尝地道肉饼。",
      "evening": "好牧羊人教堂观日落与星空。",
      "transport": "自驾（约 3 小时）",
      "tips": "夜间拍星空注意保暖，带好三脚架。"
    }
  ],
  "must_visit_spots": [
    {
      "name": "好牧羊人教堂 (Church of the Good Shepherd)",
      "category": "景点",
      "rating": "5/5",
      "highlight": "南半球极佳观星点与经典机位",
      "address_or_area": "Tekapo 湖畔"
    }
  ],
  "photo_guides": [
    {
      "location": "好牧羊人教堂与湖景",
      "best_time": "深夜 22:00 - 02:00（银河拱桥）/ 傍晚蓝调时刻",
      "composition_tips": "低角度仰拍，将教堂作为前景，搭配银河天空。",
      "outfit_color": "深色羽绒服/带有荧光反光条的户外服"
    }
  ],
  "data_sources": ["ChromaDB 私有知识库 (nz_photo.txt)", "联网实时搜索"]
}
```

---

## 六、本地部署、联调与测试验证

### 6.1 环境准备
1. 确保安装依赖：
   ```bash
   pip install -r requirements.txt
   pip install fastapi uvicorn pydantic requests
   ```
2. 初始化前端依赖：
   ```bash
   cd frontend
   npm install
   ```

### 6.2 启动服务
1. **启动 Backend API**：
   ```bash
   uvicorn backend.main:app --reload --port 8000
   ```
2. **启动 Frontend Web**：
   ```bash
   cd frontend
   npm run dev
   ```

### 6.3 验证 Checklist
* [ ] 自然语言提问能成功发送至后端。
* [ ] 触发本地 ChromaDB 检索并在 API 返回中标注数据来源。
* [ ] 前端呈现清晰直观的表格与清单卡片。
* [ ] 支持一键导出 Markdown 行程文档。

---

## 七、Git 提交与团队协作规范

1. 本开发任务在专属 Feature 分支操作：`feature/sunalan2025/fullstack-init`。
2. 提交前必须执行 `git pull --rebase origin dev`。
3. Commit Message 符合规范（如 `feat: 实现智能旅游规划全栈架构及标准 API 接口`）。
