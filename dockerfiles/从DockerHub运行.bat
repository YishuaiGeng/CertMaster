@echo off
chcp 65001 >nul
echo =========================================
echo    从 Docker Hub 运行 CertMaster
echo =========================================
echo.

REM Docker Hub 配置
set DOCKER_USERNAME=ysgeng
set IMAGE_NAME=certmaster
set IMAGE_TAG=latest
set CONTAINER_NAME=certmaster
set HOST_PORT=8000

echo 📋 配置信息:
echo    镜像: %DOCKER_USERNAME%/%IMAGE_NAME%:%IMAGE_TAG%
echo    容器名: %CONTAINER_NAME%
echo    端口: %HOST_PORT%
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

REM 停止并删除旧容器（如果存在）
echo 🔄 检查是否有旧容器...
docker ps -a | findstr "%CONTAINER_NAME%" >nul 2>&1
if not errorlevel 1 (
    echo ⚠️  发现已存在的容器，正在清理...
    docker stop %CONTAINER_NAME% >nul 2>&1
    docker rm %CONTAINER_NAME% >nul 2>&1
    echo ✅ 旧容器已清理
    echo.
)

REM 拉取最新镜像
echo 📥 拉取最新镜像...
echo    镜像: %DOCKER_USERNAME%/%IMAGE_NAME%:%IMAGE_TAG%
echo.
docker pull %DOCKER_USERNAME%/%IMAGE_NAME%:%IMAGE_TAG%
if errorlevel 1 (
    echo.
    echo ❌ 拉取镜像失败！
    echo.
    echo 可能的原因：
    echo 1. 网络连接问题
    echo 2. 镜像不存在或名称错误
    echo 3. Docker Hub 服务不可用
    echo.
    echo 💡 建议：
    echo 1. 检查网络连接
    echo 2. 访问 https://hub.docker.com/r/%DOCKER_USERNAME%/%IMAGE_NAME% 确认镜像存在
    echo 3. 配置 Docker 镜像加速器（参考 docker-镜像加速配置.txt）
    pause
    exit /b 1
)

echo.
echo ✅ 镜像拉取成功！
echo.

REM 启动容器
echo 🚀 启动容器...
echo.
docker run -d -p %HOST_PORT%:8000 ^
  --name %CONTAINER_NAME% ^
  --restart unless-stopped ^
  %DOCKER_USERNAME%/%IMAGE_NAME%:%IMAGE_TAG%

if errorlevel 1 (
    echo.
    echo ❌ 启动容器失败！
    pause
    exit /b 1
)

REM 等待容器启动
echo ⏳ 等待服务启动...
timeout /t 5 /nobreak >nul

REM 检查容器状态
docker ps | findstr "%CONTAINER_NAME%" >nul 2>&1
if errorlevel 1 (
    echo.
    echo ❌ 容器未正常运行！
    echo.
    echo 查看日志：
    docker logs %CONTAINER_NAME%
    pause
    exit /b 1
)

echo.
echo =========================================
echo    ✅ 部署成功！
echo =========================================
echo.
echo 🎉 CertMaster 已成功启动！
echo.
echo 📍 访问地址:
echo    前端页面: http://localhost:%HOST_PORT%
echo    API 文档: http://localhost:%HOST_PORT%/api/docs
echo.
echo 📊 容器管理命令:
echo    查看日志: docker logs %CONTAINER_NAME%
echo    停止容器: docker stop %CONTAINER_NAME%
echo    启动容器: docker start %CONTAINER_NAME%
echo    重启容器: docker restart %CONTAINER_NAME%
echo    删除容器: docker rm -f %CONTAINER_NAME%
echo.
echo 💡 数据持久化（可选）:
echo    如需在容器外管理数据，可停止当前容器，然后运行：
echo    docker run -d -p %HOST_PORT%:8000 --name %CONTAINER_NAME% --restart unless-stopped -v D:/CertMaster/data:/app/backend/data %DOCKER_USERNAME%/%IMAGE_NAME%:%IMAGE_TAG%
echo.
echo =========================================

pause

REM 打开浏览器
echo.
set /p OPEN_BROWSER="是否现在打开浏览器？(Y/N): "
if /i "%OPEN_BROWSER%"=="Y" (
    start http://localhost:%HOST_PORT%
)

