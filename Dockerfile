# CertMaster 单体镜像 Dockerfile
# 将前端和后端合并到一个镜像中

FROM python:3.10-slim

# 设置工作目录
WORKDIR /app

# 安装 Node.js（用于构建前端）
RUN apt-get update && apt-get install -y \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# 复制并安装后端依赖
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# 复制后端代码
COPY backend/ ./backend/

# 复制前端代码
COPY frontend/ ./frontend/

# 复制 data 文件夹（包含模板、配置等）
COPY data/ ./backend/data/

# 构建前端
WORKDIR /app/frontend
RUN npm install && npm run build

# 移动前端构建产物到后端静态文件目录
RUN mkdir -p /app/backend/static && \
    cp -r /app/frontend/dist/* /app/backend/static/

# 清理 Node.js 和前端源码（减小镜像体积）
WORKDIR /app
RUN apt-get remove -y nodejs curl && \
    apt-get autoremove -y && \
    rm -rf /app/frontend/node_modules /app/frontend/src

# 设置环境变量
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

# 切换到后端目录
WORKDIR /app/backend

# 暴露端口
EXPOSE 8000

# 启动命令
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

