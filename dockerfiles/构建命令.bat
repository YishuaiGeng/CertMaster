@echo off
chcp 65001 >nul
echo ========================================
echo   CertMaster Docker 镜像构建
echo ========================================
echo.

cd ..

echo 📋 步骤 1/4: 检查 Docker 环境...
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker 未安装或未启动
    pause
    exit /b 1
)
echo ✅ Docker 环境正常
echo.

echo 📋 步骤 2/4: 清理旧容器...
docker-compose -f dockerfiles/docker-compose.yml down >nul 2>&1
echo ✅ 旧容器已清理
echo.

echo 📋 步骤 3/4: 构建镜像（这可能需要几分钟）...
echo    - 正在构建后端镜像...
echo    - 正在构建前端镜像...
docker-compose -f dockerfiles/docker-compose.yml build
if errorlevel 1 (
    echo.
    echo ❌ 镜像构建失败！
    echo.
    echo 可能的原因：
    echo 1. 网络连接问题 - 请配置 Docker 镜像加速器
    echo 2. 磁盘空间不足
    echo 3. Docker 配置问题
    echo.
    echo 💡 解决方案：
    echo    查看文件：dockerfiles/docker-镜像加速配置.txt
    echo.
    pause
    exit /b 1
)
echo ✅ 镜像构建成功
echo.

echo 📋 步骤 4/4: 查看已构建的镜像...
docker images | findstr "certmaster\|REPOSITORY"
echo.

echo ========================================
echo   ✅ 镜像构建完成！
echo ========================================
echo.
echo 💡 下一步：启动服务
echo    docker-compose -f dockerfiles/docker-compose.yml up -d
echo.
echo    或运行：dockerfiles\docker-start.bat
echo.
echo ========================================

pause

