# Travel-planner-agent — 智能旅行规划系统

> 团队项目 | 基于 OpenClaw 智能体 + 自研 RAG + 前端交互页面

## 整体架构

```
用户 → 前端页面 → OpenClaw 智能体核心 → 双工具并行
                                        │
                          ┌─────────────┼─────────┐
                          ▼                       ▼          
                 自研 RAG 向量知识库        联网搜索 API             
              (Chroma + Embedding)      (网页摘要抓取)        
                          │                       │
                          └────────────┼──────────┘
                                       ▼
                           前端展示 / Markdown 导出
```

系统分为三大核心模块，互相配合：

| 模块 | 位置 | 职责 |
|------|------|------|
| **OpenClaw 智能体调度核心** | `openclaw-agent/` | 任务拆解、工具编排、大模型推理决策 |
| **自研 RAG 向量知识库** | `rag-knowledge-base/` | 私有领域资料离线分片→嵌入→检索 |
| **前端交互页面** | `frontend/` | 用户输入/调整需求、行程展示、导出 |

---

## 项目结构

```
Travel-planner-agent/
├── README.md                     
├── .gitignore
│
├── frontend/                     # 前端交互页面
│   ├── public/                   # 静态资源（favicon、图片等）
│   ├── src/                      # 源码
│   ├── components/               # 可复用组件
│   └── ...
│
├── openclaw-agent/               # OpenClaw 智能体核心
│   ├── config/                   # 智能体配置文件
│   ├── tools/                    # 自定义工具定义（RAG 检索、联网搜索等）
│   ├── prompts/                  # 系统提示词模板
│   ├── workflows/                # 工作流编排
│   └── ...
│
├── rag-knowledge-base/           # 自研 RAG 向量知识库
│   ├── data/
│   │   ├── raw/                  # 原始私有资料（PDF/TXT 等）
│   │   └── chunks/              # 文本分片后的片段
│   ├── chroma_db/               # Chroma 向量数据库持久化目录
│   ├── embedding/               # Embedding 模型加载与调用代码
│   ├── retriever/               # 检索模块代码
│   └── ...
│
├── docs/                         # 项目文档
│   ├── architecture/            # 架构设计文档
│   ├── slides/                  # 答辩 PPT 资源
│   └── ...
│
├── scripts/                      # 辅助脚本
│   ├── process_docs.sh          # 文档预处理（PDF→TXT→分片）
│   ├── build_kb.py              # 构建知识库（嵌入→存入 Chroma）
│   └── ...
│
└── tests/                        # 测试用例
    ├── test_rag.py              # RAG 检索测试
    ├── test_agent.py            # 智能体流程测试
    └── ...
```

### 各文件夹说明

- **frontend/** — 面向用户的网页端，负责需求输入、行程可视化、Markdown 导出、二次修改迭代
- **openclaw-agent/** — 系统的"大脑"，基于 OpenClaw 框架，自主拆分任务、调用工具、组织大模型输出
- **rag-knowledge-base/** — 核心私有知识库，离线收集新西兰自驾、摄影等资料，在线语义检索
- **docs/** — 团队协作文档、架构图、答辩材料，供全员查阅
- **scripts/** — 数据处理、构建、部署等自动化脚本
- **tests/** — 测试用例集合，覆盖正常需求、缺省参数、极端条件等场景

---

## 核心工作流程

### 1️ 离线预处理

```
私有资料（PDF/TXT）→ 文本分片 → Embedding 向量化 → 存入 Chroma 向量数据库
```

- 收集新西兰自驾攻略、季节指南、风光摄影机位、调色参数等 PDF/TXT
- 按固定长度（如 512 tokens）分片，保留语义连续性
- 调用 Embedding 模型生成向量，存入本地 Chroma DB

### 2️ 用户交互 → 智能体推理

```
用户输入需求 → 前端传参 → OpenClaw 智能体
                           ├─ 需求拆解、反问补全信息
                           ├─ 调用 RAG 检索私有资料
                           ├─ 调用联网搜索获取实时信息
                           └─ 拼接后送入大模型生成
             → 返回结构化行程 → 前端格式化展示 → 支持导出/迭代
```

### 3️ 配套工作

- 开发阶段：设计测试用例，覆盖缺省需求/极端条件
- 收尾阶段：画架构流程图、写项目报告、做答辩 PPT、录制演示视频

---

## Git 工作规范

### 分支策略

| 分支 | 用途 | 保护规则 |
|------|------|---------|
| `main` | 稳定发布版本，仅通过 PR 合入 | 受保护，禁止直接 push！ |
| `dev` | 日常开发集成分支 | 受保护，禁止直接 push |
| `feature/<姓名>/<功能>` | 个人功能开发分支，如 `feature/小明/frontend-basic` | 自由推送 |
| `docs/*` | 文档修改分支 | 自由推送 |

### 工作流程

1. **每个人从 `dev` 拉出自己的 feature 分支**
   ```bash
   git checkout dev
   git pull
   git checkout -b feature/<姓名>/<描述>
   ```

2. **在 feature 分支上开发，频繁提交**
   ```bash
   git add .
   git commit -m "feat: 添加某功能"
   ```

3. **完成后发起 Pull Request → `dev`**
   - PR 标题格式：`feat/fix/docs: 简短描述`
   - PR 描述中写明改动和测试情况
   - 至少 **一人 Review 通过** 后方可合入

4. **统一合并到 `dev`，定期合并到 `main`**
   - `dev` → `main` 的 PR 需要全员确认，对应发布节点

### Commit Message 规范

```
<type>: <简短描述>

# type 可选
feat    — 新功能
fix     — 修复 bug
docs    — 文档修改
style   — 格式调整（不影响代码逻辑）
refactor— 重构
test    — 测试相关
chore   — 构建/CI/工具链
```

### 注意事项

- **禁止直接 push 到 `main` 和 `dev`**
- **禁止在 PR Review 未通过时自行合入**
- **禁止提交大文件（>10MB），资料文件统一管理在 `rag-knowledge-base/data/` 下**
- **每天工作结束前 push 一次，避免丢失**
- **合入前先 `git pull --rebase` 保持历史整洁**
- **遇到冲突及时在微信群里沟通**

---

## 注意事项

1. **私有资料版权** — 收集的攻略 仅供项目内学习使用，不得外传
2. **API Key 安全** — 联网搜索 API、大模型 API 的 key 通过环境变量注入，**禁止提交到 Git**
3. **Chroma DB 体积** — 向量数据库文件可能较大，考虑在 `.gitignore` 中排除
4. **分片策略** — 文本分片长度需平衡上下文窗口与检索精度，后期可根据效果调整
5. **前端轻量化** — 以功能优先，不要过度设计样式，留时间给完善逻辑

---

## 技术栈参考

| 组件 | 推荐技术 |
|------|---------|
| 前端 | React / Vue + Tailwind CSS |
| 智能体 | OpenClaw 框架 + 龙虾大模型 |
| 向量数据库 | Chroma (本地持久化) |
| Embedding | 开源模型 (如 BGE、text-embedding-3-small) |
| 联网搜索 | SerpAPI / Tavily / 自定义搜索引擎 API |
| 文档处理 | LangChain / LlamaIndex 分片工具 |
