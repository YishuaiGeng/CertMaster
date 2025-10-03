@echo off
chcp 65001 >nul
echo ========================================
echo    CertMaster 证书制作系统
echo ========================================
echo.

echo [1/3] 检查 Python 环境...
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 未找到 Python，请先安装 Python 3.8+
    pause
    exit /b 1
)

echo [2/3] 检查 Node.js 环境...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 未找到 Node.js，请先安装 Node.js
    pause
    exit /b 1
)

echo [3/3] 检查依赖...
if not exist "frontend\node_modules" (
    echo ⚠️  前端依赖未安装，正在安装...
    cd frontend
    call npm install
    cd ..
)

echo.
echo ========================================
echo    启动服务...
echo ========================================
echo.

echo 🚀 启动后端服务 (端口 8000)...
start "CertMaster-Backend" cmd /k "cd backend && pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

timeout /t 3 /nobreak >nul

echo 🚀 启动前端服务 (端口 3000)...
start "CertMaster-Frontend" cmd /k "cd frontend && npm run dev"

timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo    ✅ 服务启动成功！
echo ========================================
echo.
echo 📍 前端地址: http://localhost:5173
echo 📍 后端地址: http://localhost:8000
echo 📍 API 文档: http://localhost:8000/api/docs
echo.
echo 💡 提示:
echo    - 前端和后端在独立窗口中运行
echo    - 关闭对应窗口即可停止服务
echo    - 修改代码会自动热重载
echo.
echo ========================================

timeout /t 5 /nobreak

pause

