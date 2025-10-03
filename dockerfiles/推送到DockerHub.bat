@echo off
chcp 65001 >nul
echo =========================================
echo    推送镜像到 Docker Hub
echo =========================================
echo.

REM Docker Hub 配置
set DOCKER_USERNAME=ysgeng
set IMAGE_NAME=certmaster
set IMAGE_TAG=latest

echo 📋 配置信息:
echo    用户名: %DOCKER_USERNAME%
echo    镜像名: %IMAGE_NAME%
echo    标签: %IMAGE_TAG%
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

REM 检查是否已登录
echo 🔐 检查登录状态...
docker info | findstr "Username" >nul 2>&1
if errorlevel 1 (
    echo.
    echo ⚠️  您还未登录 Docker Hub，请输入凭据:
    echo.
    docker login
    if errorlevel 1 (
        echo ❌ 登录失败！
        pause
        exit /b 1
    )
    echo.
    echo ✅ 登录成功！
    echo.
) else (
    echo ✅ 已登录 Docker Hub
    echo.
)

REM 检查本地镜像是否存在
echo 🔍 检查本地镜像...
docker images | findstr "%IMAGE_NAME%.*%IMAGE_TAG%" >nul 2>&1
if errorlevel 1 (
    echo ⚠️  本地未找到镜像 %IMAGE_NAME%:%IMAGE_TAG%
    echo.
    set /p BUILD_NOW="是否现在构建镜像？(Y/N): "
    if /i "%BUILD_NOW%"=="Y" (
        echo.
        echo 🏗️  开始构建镜像...
        cd ..
        docker build -t %IMAGE_NAME%:%IMAGE_TAG% -f Dockerfile .
        if errorlevel 1 (
            echo ❌ 镜像构建失败！
            pause
            exit /b 1
        )
        echo ✅ 镜像构建成功！
        echo.
    ) else (
        echo.
        echo ❌ 取消操作。请先构建镜像：
        echo    docker build -t %IMAGE_NAME%:%IMAGE_TAG% -f Dockerfile .
        pause
        exit /b 1
    )
) else (
    echo ✅ 找到本地镜像
    echo.
)

REM 打标签
echo 🏷️  为镜像打标签...
docker tag %IMAGE_NAME%:%IMAGE_TAG% %DOCKER_USERNAME%/%IMAGE_NAME%:%IMAGE_TAG%
if errorlevel 1 (
    echo ❌ 打标签失败！
    pause
    exit /b 1
)
echo ✅ 标签已创建: %DOCKER_USERNAME%/%IMAGE_NAME%:%IMAGE_TAG%
echo.

REM 推送到 Docker Hub
echo 📤 推送镜像到 Docker Hub...
echo    这可能需要几分钟，请耐心等待...
echo.
docker push %DOCKER_USERNAME%/%IMAGE_NAME%:%IMAGE_TAG%
if errorlevel 1 (
    echo.
    echo ❌ 推送失败！
    echo.
    echo 可能的原因：
    echo 1. 网络连接问题
    echo 2. 权限不足（请确认您是仓库所有者）
    echo 3. 镜像标签格式错误
    pause
    exit /b 1
)

echo.
echo =========================================
echo    ✅ 推送成功！
echo =========================================
echo.
echo 🎉 镜像已成功推送到 Docker Hub！
echo.
echo 📍 镜像地址: %DOCKER_USERNAME%/%IMAGE_NAME%:%IMAGE_TAG%
echo.
echo 💡 其他用户现在可以通过以下命令拉取：
echo    docker pull %DOCKER_USERNAME%/%IMAGE_NAME%:%IMAGE_TAG%
echo.
echo 💡 运行容器：
echo    docker run -d -p 8000:8000 --name certmaster --restart unless-stopped %DOCKER_USERNAME%/%IMAGE_NAME%:%IMAGE_TAG%
echo.
echo 🔗 Docker Hub 页面: https://hub.docker.com/r/%DOCKER_USERNAME%/%IMAGE_NAME%
echo.
echo =========================================

pause

