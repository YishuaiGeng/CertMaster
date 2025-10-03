@echo off
chcp 65001 >nul
echo ========================================
echo   CertMaster 单体镜像构建
echo ========================================
echo.

cd ..

echo 📋 步骤 1/3: 检查 Docker 环境...
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker 未安装或未启动
    pause
    exit /b 1
)
echo ✅ Docker 环境正常
echo.

echo 📋 步骤 2/3: 构建单体镜像（这可能需要 5-10 分钟）...
echo    - 正在安装 Node.js...
echo    - 正在安装 Python 依赖...
echo    - 正在构建前端...
echo    - 正在合并前后端...
docker build -t certmaster:latest -f Dockerfile .
if errorlevel 1 (
    echo.
    echo ❌ 镜像构建失败！
    pause
    exit /b 1
)
echo ✅ 镜像构建成功
echo.

echo 📋 步骤 3/3: 查看镜像信息...
docker images | findstr "certmaster\|REPOSITORY"
echo.

echo ========================================
echo   ✅ 单体镜像构建完成！
echo ========================================
echo.
echo 镜像名称: certmaster:latest
echo 镜像大小: 见上方
echo.
echo 💡 下一步：启动容器
echo    docker run -d -p 8000:8000 --name certmaster certmaster:latest
echo.
echo    或使用 docker-compose:
echo    docker-compose -f docker-compose-single.yml up -d
echo.
echo 🌐 访问地址:
echo    前端+后端: http://localhost:8000
echo    API 文档: http://localhost:8000/api/docs
echo.
echo ========================================

pause

