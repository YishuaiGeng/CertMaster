@echo off
chcp 65001 >nul
echo =========================================
echo    CertMaster Docker 部署脚本
echo =========================================
echo.

REM 检查 Docker 是否安装
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 未找到 Docker，请先安装 Docker Desktop
    echo 下载地址: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

echo ✅ Docker 环境检查通过
echo.

REM 停止并删除旧容器
echo 🔄 清理旧容器...
docker-compose down 2>nul

REM 构建并启动容器
echo.
echo 🏗️  构建镜像...
docker-compose build

echo.
echo 🚀 启动服务...
docker-compose up -d

echo.
echo =========================================
echo    ✅ 服务启动成功！
echo =========================================
echo.
echo 📍 前端地址: http://localhost
echo 📍 后端 API: http://localhost:8000
echo 📍 API 文档: http://localhost:8000/api/docs
echo.
echo 💡 常用命令:
echo    - 查看日志: docker-compose logs -f
echo    - 停止服务: docker-compose down
echo    - 重启服务: docker-compose restart
echo.
echo =========================================

pause

