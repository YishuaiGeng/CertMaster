#!/bin/bash

echo "========================================="
echo "   CertMaster Docker 部署脚本"
echo "========================================="
echo ""

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ 未找到 Docker，请先安装 Docker"
    exit 1
fi

# 检查 Docker Compose 是否安装
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ 未找到 Docker Compose，请先安装 Docker Compose"
    exit 1
fi

echo "✅ Docker 环境检查通过"
echo ""

# 停止并删除旧容器
echo "🔄 清理旧容器..."
docker-compose down 2>/dev/null || docker compose down 2>/dev/null || true

# 构建并启动容器
echo ""
echo "🏗️  构建镜像..."
docker-compose build || docker compose build

echo ""
echo "🚀 启动服务..."
docker-compose up -d || docker compose up -d

echo ""
echo "========================================="
echo "   ✅ 服务启动成功！"
echo "========================================="
echo ""
echo "📍 前端地址: http://localhost"
echo "📍 后端 API: http://localhost:8000"
echo "📍 API 文档: http://localhost:8000/api/docs"
echo ""
echo "💡 常用命令:"
echo "   - 查看日志: docker-compose logs -f"
echo "   - 停止服务: docker-compose down"
echo "   - 重启服务: docker-compose restart"
echo ""
echo "========================================="

