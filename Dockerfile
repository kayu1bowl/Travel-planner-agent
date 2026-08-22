# =========================================================================
# Stage 1: 前端生产构建 (Frontend Build Stage)
# =========================================================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# =========================================================================
# Stage 2: 生产全栈镜像 (Production Fullstack Runner)
# =========================================================================
FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=80

WORKDIR /app

# 安装 Nginx 与基础依赖
RUN apt-get update && apt-get install -y --no-install-recommends \
    nginx \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 安装 Python 核心依赖
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt \
    && pip install --no-cache-dir uvicorn fastapi python-dotenv pydantic gunicorn

# 拷贝后端与智能体代码
COPY backend/ ./backend/
COPY openclaw_agent/ ./openclaw_agent/
COPY rag-knowledge-base/ ./rag-knowledge-base/

# 拷贝前端构建产物
COPY --from=frontend-builder /app/frontend/dist /app/frontend_dist

# 配置 Nginx
COPY deploy/nginx.conf /etc/nginx/sites-available/default
RUN ln -sf /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default

# 拷贝启动脚本
COPY deploy/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/app/entrypoint.sh"]
