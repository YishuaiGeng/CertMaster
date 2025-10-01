#!/bin/bash
# CertMaster 启动脚本 (Linux/Mac)
# 用法: ./start.sh

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}   CertMaster 证书制作系统${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""

# 检查 Python
echo -e "${YELLOW}[1/3] 检查 Python 环境...${NC}"
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo -e "${GREEN}✅ $PYTHON_VERSION${NC}"
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    PYTHON_VERSION=$(python --version)
    echo -e "${GREEN}✅ $PYTHON_VERSION${NC}"
    PYTHON_CMD="python"
else
    echo -e "${RED}❌ 未找到 Python，请先安装 Python 3.8+${NC}"
    exit 1
fi

# 检查 Node.js
echo -e "${YELLOW}[2/3] 检查 Node.js 环境...${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js $NODE_VERSION${NC}"
else
    echo -e "${RED}❌ 未找到 Node.js，请先安装 Node.js${NC}"
    exit 1
fi

# 检查依赖
echo -e "${YELLOW}[3/3] 检查依赖...${NC}"
if [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}⚠️  前端依赖未安装，正在安装...${NC}"
    cd frontend
    npm install
    cd ..
fi

echo ""
echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}   启动服务...${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""

# 创建临时脚本来捕获进程 ID
BACKEND_PID=""
FRONTEND_PID=""

# 清理函数
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 正在停止服务...${NC}"
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    echo -e "${GREEN}✅ 服务已停止${NC}"
    exit 0
}

# 捕获 Ctrl+C
trap cleanup INT TERM

# 启动后端
echo -e "${GREEN}🚀 启动后端服务 (端口 8000)...${NC}"
cd backend
pip install -r requirements.txt -q
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 > /dev/null 2>&1 &
BACKEND_PID=$!
cd ..

sleep 3

# 启动前端
echo -e "${GREEN}🚀 启动前端服务 (端口 5173)...${NC}"
cd frontend
npm run dev > /dev/null 2>&1 &
FRONTEND_PID=$!
cd ..

sleep 2

echo ""
echo -e "${CYAN}========================================${NC}"
echo -e "${GREEN}   ✅ 服务启动成功！${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""
echo -e "📍 前端地址: ${CYAN}http://localhost:5173${NC}"
echo -e "📍 后端地址: ${CYAN}http://localhost:8000${NC}"
echo -e "📍 API 文档: ${CYAN}http://localhost:8000/api/docs${NC}"
echo ""
echo -e "${YELLOW}💡 提示:${NC}"
echo "   - 按 Ctrl+C 停止所有服务"
echo "   - 修改代码会自动热重载"
echo "   - 服务运行在前台，关闭终端会停止服务"
echo ""
echo -e "${CYAN}========================================${NC}"

# 尝试打开浏览器
if command -v xdg-open &> /dev/null; then
    sleep 3
    echo -e "${GREEN}🌐 正在打开浏览器...${NC}"
    xdg-open http://localhost:5173 &> /dev/null &
elif command -v open &> /dev/null; then
    sleep 3
    echo -e "${GREEN}🌐 正在打开浏览器...${NC}"
    open http://localhost:5173 &> /dev/null &
fi

echo ""
echo -e "${YELLOW}按 Ctrl+C 停止服务...${NC}"
echo ""

# 等待进程
wait $BACKEND_PID $FRONTEND_PID

