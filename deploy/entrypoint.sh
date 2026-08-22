#!/bin/bash
set -e

echo "🚀 [Startup] 正在启动 OpenClaw Agent (Port 8080)..."
python -m openclaw_agent.api.server &
AGENT_PID=$!

echo "🚀 [Startup] 正在启动 FastAPI 后端服务 (Port 8000)..."
python backend/main.py &
BACKEND_PID=$!

echo "🚀 [Startup] 正在启动 Nginx Web 服务器 (Port 80)..."
nginx -g "daemon off;" &
NGINX_PID=$!

# 等待任一子进程退出
wait -n $AGENT_PID $BACKEND_PID $NGINX_PID
