# Travel_planner_agent — 智能旅行规划系统

> 团队项目 | 基于 OpenClaw 智能体 + 自研 RAG + 前端交互页面

## 整体架构

```
用户 → 前端页面 → OpenClaw 智能体核心 → 双工具并行
                                        │
                          ┌─────────────┼─────────┐
                          ▼                       ▼
                 自研 RAG 向量知识库        联网搜索 API
              (Chroma/FAISS + Embedding)  (网页摘要抓取)
                          │                       │
                          └────────────┼──────────┘
                                       ▼
                           前端展示 / Markdown 导出
```

系统分为三大核心模块，互相配合：

| 模块 | 位置 | 职责 |
|------|------|------|
| **OpenClaw 智能体调度核心** | `openclaw_agent/` | 任务拆解、工具编排、大模型推理决策 |
| **自研 RAG 向量知识库** | `rag_knowledge_base/` | 私有领域资料离线分片→嵌入→检索 |
| **前端交互页面** | `frontend/` | 用户输入/调整需求、行程展示、导出 |

---

## 项目结构

```
Travel_planner_agent/
├── README.md
├── .gitignore
├── requirements.txt               # Python 依赖（llama-index, chromadb, sentence-transformers 等）
│
├── frontend/                      # 前端交互页面
│   ├── public/                    # 静态资源（favicon、图片等）
│   ├── src/                       # 源码
│   ├── components/                # 可复用组件
│   └── ...
│
├── openclaw_agent/                # OpenClaw 智能体核心
│   ├── __init__.py
│   ├── main.py                    # 智能体入口（CLI / 模块调用）
│   ├── config/
│   │   ├── __init__.py
│   │   └── agent_config.py        # 全局配置：LLM / RAG / Web Search
│   ├── tools/
│   │   ├── __init__.py
│   │   ├── rag_search.py          # RAG 检索工具（对接本地 retriever）
│   │   ├── web_search.py          # 联网搜索（Tavily / SerpAPI / Mock）
│   │   └── format_output.py       # 行程格式化 + LLM 调用
│   ├── prompts/
│   │   ├── __init__.py
│   │   └── system_prompt.md       # 旅行规划专家系统提示词
│   ├── workflows/
│   │   ├── __init__.py
│   │   └── travel_planner.py      # 旅行规划主流程编排
│   └── api/
│       ├── __init__.py
│       ├── server.py              # FastAPI 后端服务
│       └── frontend_api.md        # 前后端接口规范
│
├── rag_knowledge_base/            # 自研 RAG 向量知识库
│   ├── __init__.py
│   ├── config.py                  # 统一配置：模型ID、路径、BUILD_MODE、IPEX加速、CPU线程数
│   ├── builder.py                 # 知识库构建入口（分片→清洗→分类→评分→嵌入→存储）
│   ├── classifier.py              # LLM Prompt 驱动智能分类（零硬编码关键词，三档 Prompt）
│   ├── precision.py               # LLM Prompt 驱动精密等级评分器（零硬编码关键词）
│   │
│   ├── embedding/
│   │   ├── __init__.py
│   │   └── cleaner.py             # CRAG 三级清洗：LLM Prompt 驱动（零硬编码关键词，三档 Prompt）
│   │
│   ├── retriever/
│   │   ├── __init__.py
│   │   └── retriever.py           # 检索器（FAISS + Chroma 双后端）
│   │
│   ├── crawler/
│   │   ├── __init__.py
│   │   ├── social_fetcher.py      # 中文社交平台游记采集（马蜂窝/穷游/小红书）
│   │   ├── crawl4ai_fetcher.py    # 英文官方/百科信息采集
│   │   └── multi_country_fetcher.py # 28国多源爬虫（Wikivoyage+Wikipedia+OSM）
│   │
│   ├── data/
│   │   ├── raw/                   # 原始私有资料（PDF/TXT 等）
│   │   └── chunks/                # 文本分片后的片段
│   │
│   ├── chroma_db/                 # Chroma 向量数据库持久化目录
│   ├── vector_db/                 # FAISS 索引 + 元数据持久化目录（默认）
│   └── faiss_index/               # FAISS 索引持久化目录（可选自定义路径）
│
├── scripts/                       # 辅助脚本
│   ├── auto_build_kb.py           # 一键构建知识库（CLI入口，支持 --build-mode）
│   └── test_pipeline.py           # 全流程测试（23项，覆盖语法/功能/后端/模型/错误路径）
│
├── docs/                          # 项目文档
│   ├── architecture/              # 架构设计文档
│   ├── slides/                    # 答辩 PPT 资源
│   └── ...
│
└── tests/                         # 测试用例
    ├── test_rag.py                # RAG 检索测试
    ├── test_agent.py              # 智能体流程测试
    └── ...
```

### 各文件夹说明

- **frontend/** — 面向用户的网页端，负责需求输入、行程可视化、Markdown 导出、二次修改迭代
- **openclaw_agent/** — 系统的"大脑"，基于 OpenClaw 框架，自主拆分任务、调用工具、组织大模型输出
- **rag_knowledge_base/** — 核心私有知识库，离线收集新西兰自驾、摄影等资料，在线语义检索
- **docs/** — 团队协作文档、架构图、答辩材料，供全员查阅
- **scripts/** — 数据处理、构建、部署等自动化脚本
- **tests/** — 测试用例集合，覆盖正常需求、缺省参数、极端条件等场景

---

## 核心工作流程

### 1️⃣ 离线预处理

```
私有资料（PDF/TXT）→ 文本分片 → CRAG 清洗 → 分类 → 精密评分 → Embedding 向量化 → 存入向量数据库
```

- 收集新西兰自驾攻略、季节指南、风光摄影机位、调色参数等 PDF/TXT
- 支持两种数据来源：
  - **本地文件**：放入 `data/raw/` 后通过 `--mode local` 构建
  - **网络爬虫**：`multi_country_fetcher.py`（28国百科）+ `crawl4ai_fetcher.py`（英文官网）+ `social_fetcher.py`（中文社交），三套互补
- 分片后经过三级清洗（噪声过滤→质量评分→攒批推理）
- 智能分类（12个旅行类目）和精密等级评分（high/medium/low）
- 支持 FAISS 和 Chroma 两种向量数据库后端

### 三种构建模式

| 模式 | 命令 | 推理模型 | Prompt 强度 | 分片大小 | R3 批推理 | 分类 | 精密评分 | 重排 | 适用场景 |
|------|------|---------|-----------|---------|---------|------|---------|------|---------|
| `fast` | `--build-mode fast` | Qwen2.5-1.5B | 极简（单句判定） | 768 | ❌ | ✅ | ✅ | ❌ | 快速预览、开发调试 |
| `balanced` | `--build-mode balanced` | Qwen2.5-1.5B | 中等（带评分标准） | 512 | ✅ | ✅ | ✅ | ✅ | 日常使用（推荐） |
| `precise` | `--build-mode precise` | Qwen3-14B | 完整（含示例+细化） | 384 | ✅ | ✅ | ✅ | ✅ | 高精度场景 |

也可通过单个参数微调：
- `--no-qwen3`：跳过所有模型调用，仅使用 R1 纯物理过滤
- `--no-classify`：跳过智能分类，全部归为 general
- `--no-summary`：跳过文档级智能总结

**重要**：`--build-mode` 参数同时支持 `builder.py` 和 `scripts/auto_build_kb.py` 两个入口。
- `python rag_knowledge_base\builder.py --mode local --build-mode balanced`
- `python scripts/auto_build_kb.py --mode local --build-mode balanced`

### 2️⃣ 用户交互 → 智能体推理

```
用户输入需求 → 前端传参 → OpenClaw 智能体
                           ├─ 需求拆解、反问补全信息
                           ├─ 调用 RAG 检索私有资料
                           ├─ 调用联网搜索获取实时信息
                           └─ 拼接后送入大模型生成
             → 返回结构化行程 → 前端格式化展示 → 支持导出/迭代
```

### 3️⃣ 配套工作

- 开发阶段：设计测试用例，覆盖缺省需求/极端条件
- 收尾阶段：画架构流程图、写项目报告、做答辩 PPT、录制演示视频

---

## 快速开始

### 安装依赖

```bash
pip install -r requirements.txt
```

根据后端选择安装向量库：
```bash
# FAISS 后端（推荐）
pip install faiss-cpu

# Chroma 后端（自动随 chromadb 安装）
```

### 构建知识库

```bash
# 快速构建（纯规则，无模型依赖）
python scripts/auto_build_kb.py --mode local --build-mode fast

# 标准构建（需要 Qwen2.5-1.5B，首次运行自动下载约 3GB）
python scripts/auto_build_kb.py --mode local --build-mode balanced

# 高精度构建（需要 Qwen3-14B，首次运行自动下载约 30GB）
python scripts/auto_build_kb.py --mode local --build-mode precise
```

### 运行全流程测试

```bash
python scripts/test_pipeline.py
```

测试覆盖 85 项：语法检查（11个文件）、配置注入、CLI 参数矩阵、CRAG 清洗、规则分类、精密评分、检索后端、错误路径、全系统覆盖扫描、多国爬虫模块等。

---

## OpenClaw 智能体（AI Agent）

`openclaw_agent/` 是系统的智能调度核心，支持独立运行和 FastAPI 服务两种模式。

## RAG 知识库详解

### 三层清洗架构 — LLM Prompt 驱动（零硬编码关键词）

参考 CRAG (arXiv:2401.15884)、FILCO (arXiv:2309.04772)、RAPTOR (arXiv:2401.18059)。
**全部文本筛选/分类/评分均由 LLM Prompt 驱动，没有任何硬编码的关键词或正则规则。**

| 层级 | 策略 | Prompt 特征 | 速度 |
|------|------|-------------|------|
| **R1** | 物理级过滤（纯结构：空行、纯符号，不涉及语义） | 无模型 | 纳秒级 |
| **R2** | LLM Prompt 驱动单行质量评分（按 BUILD_MODE 分三档） | 由 model 自主判断 | 秒级 |
| **R3** | LLM 攒批批量评估模糊片段（同样三档 Prompt） | 由 model 自主判断 | 秒级/批 |

**三个强度等级的 Prompt 设计**：
- **fast** → 极简 Prompt（单句判定，是/否快速过滤）
- **balanced** → 中等 Prompt（带具体评分标准+维度说明）
- **precise** → 完整 Prompt（含 Few-shot 示例+细化评估维度+边界案例指导）

### 精密等级评分 — LLM Prompt 驱动

纯 LLM 驱动的零关键词评分系统（`precision.py`），每个分片标注内容精细度。
由 BUILD_MODE 选择 Prompt 强度（三档），模型自主判断：

| 等级 | 含义 |
|------|------|
| `high` | 含事实数据：价格、电话、地址、开放时间、路线等 |
| `medium` | 有细节的个人经验：店名、花费、具体建议、行程结构 |
| `low` | 泛泛而谈：纯情感词、模糊态度、极短文本 |
| `uncertain` | 兜底 |

**零硬编码**：没有任何预设的关键词/正则规则。所有判断由 LLM 根据 Prompt 中的等级定义自主完成。

### 智能分类 — LLM Prompt 驱动（零硬编码）

维护由 LLM 自主发现并定义的分类体系（classifier.py），流程：

1. **分类发现** — 采样 50~100 个片段，由 LLM 阅读后自主决定分类体系
2. **逐条分类** — 对每个片段用 LLM 归入最合适的类别
3. **零关键词** — 不预设任何关键词或正则规则

### 检索后端

| 后端 | 位置 | 特点 |
|------|------|------|
| **FAISS** | `retriever/retriever.py` | 高性能向量检索，最远邻搜索 |
| **Chroma** | `retriever/retriever.py` | 元数据过滤，`where` 条件查询（分类/评分） |

---

## 模型与加速

### 支持的模型

| 用途 | 默认模型 | 大小 | 说明 |
|------|---------|------|------|
| Embedding | BAAI/bge-m3 | ~2.2GB | 向量化，维度 1024 |
| 清洗（balanced） | Qwen2.5-1.5B-Instruct | ~3GB | CRAG R3 推理 |
| 清洗（precise） | Qwen3-14B | ~30GB | CRAG R3 推理 |
| 分类 | 同清洗模型 | — | 复用清洗模型 |
| 重排序 | BAAI/bge-reranker-v2-m3 | ~2.2GB | 检索结果重排 |

### CPU 推理加速

Windows 本机 CPU 运行时（无 GPU），系统自动启用三层加速：

1. **IPEX `ipex.llm.optimize()`** — 算子融合、IAKV（间接访问 KV Cache）、融合 ROPE/RMSNorm
2. **CPU 线程数自适应** — 自动检测物理核心数，上限 32 线程
3. **Model warmup 预热** — 首次推理后加速 10~30%

非 Intel CPU 或未安装 IPEX 时自动跳过，不影响正常使用。

### 模型加载与缓存

所有模型（Embedding、Qwen、Reranker）使用 HuggingFace `transformers` 加载：

```python
# 自动检测本地缓存，优先离线加载
import os
os.environ["HF_HUB_OFFLINE"] = "1"  # 强制仅本地缓存

# 缓存目录覆盖策略（Windows/Linux 通用）
# 按顺序检查：环境变量 → D:/huggingface/hub/ → C:/huggingface/hub/ → 默认缓存
```

---

## 路径机制

所有模块使用 **动态路径检测**，无需硬编码：

```python
def _find_project_root(path: Path) -> Path:
    """向上搜索包含 rag_knowledge_base/ 的目录"""
    for p in [path, *path.parents]:
        if (p / "rag_knowledge_base").is_dir():
            return p
    return path.parent
```

| 文件 | 检测方式 |
|------|---------|
| `config.py` | `PROJECT_ROOT = Path(__file__).parent.parent` |
| `builder.py` | `_find_project_root()` |
| `cleaner.py` | `_find_project_root()` |
| `retriever.py` | 动态搜索父目录 |
| `social_fetcher.py` | `_find_project_root()` |
| `crawl4ai_fetcher.py` | `_find_project_root()` |
| `multi_country_fetcher.py` | `_find_project_root()` |
| `auto_build_kb.py` | 遍历父目录找 `rag_knowledge_base/` |
| `test_pipeline.py` | `Path(__file__).parent.parent` |

如需修改项目整体路径，只需修改 `rag_knowledge_base/config.py` 中的 `PROJECT_ROOT`，或通过环境变量 `PROJECT_ROOT` 覆盖。

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
- **禁止提交大文件（>10MB），资料文件统一管理在 `rag_knowledge_base/data/` 下**
- **每天工作结束前 push 一次，避免丢失**
- **合入前先 `git pull --rebase` 保持历史整洁**
- **遇到冲突及时在微信群里沟通**

---

## 注意事项

1. **私有资料版权** — 收集的攻略仅供项目内学习使用，不得外传
2. **API Key 安全** — 联网搜索 API、大模型 API 的 key 通过环境变量注入，**禁止提交到 Git**
3. **Chroma/FAISS 数据库体积** — 向量数据库文件可能较大，考虑在 `.gitignore` 中排除
4. **分片策略** — 文本分片长度随 BUILD_MODE 自动调整（fast=768, balanced=512, precise=384）
5. **前端轻量化** — 以功能优先，不要过度设计样式，留时间给完善逻辑
6. **磁盘空间** — 模型总计约 40GB（bge-m3 + Qwen2.5-1.5B + Qwen3-14B + reranker）

---

## 技术栈参考

| 组件 | 推荐技术 |
|------|---------|
| 前端 | React / Vue + Tailwind CSS |
| 智能体 | OpenClaw 框架 |
| 向量数据库 | Chroma (本地持久化) + FAISS |
| Embedding | BAAI/bge-m3 (1024维) |
| 清洗/分类 | Qwen2.5-1.5B-Instruct / Qwen3-14B |
| 重排序 | BAAI/bge-reranker-v2-m3 |
| 联网搜索 | SerpAPI / Tavily / 自定义搜索引擎 API |
| 文档处理 | LangChain / LlamaIndex 分片工具 |
| CPU 加速 | Intel Extension for PyTorch (IPEX) |