#!/usr/bin/env python3
"""
CertMaster 启动脚本 - 同时启动前端和后端
"""
import subprocess
import sys
import os
from pathlib import Path
import time

# 项目根目录
ROOT_DIR = Path(__file__).parent.parent
FRONTEND_DIR = ROOT_DIR / "frontend"
BACKEND_DIR = ROOT_DIR / "backend"

def check_dependencies():
    """检查依赖是否已安装"""
    print("🔍 检查依赖...")
    
    # 检查前端依赖
    if not (FRONTEND_DIR / "node_modules").exists():
        print("⚠️  前端依赖未安装")
        print("   请运行: cd frontend && npm install")
        return False
    
    # 检查后端依赖
    try:
        import fastapi
        import uvicorn
        print("✅ 依赖检查通过")
        return True
    except ImportError:
        print("⚠️  后端依赖未安装")
        print("   请运行: cd backend && pip install -r requirements.txt")
        return False

def start_frontend():
    """启动前端"""
    print("\n🚀 启动前端服务...")
    frontend_process = subprocess.Popen(
        ["npm", "run", "dev"],
        cwd=str(FRONTEND_DIR),
        shell=True
    )
    return frontend_process

def start_backend():
    """启动后端"""
    print("\n🚀 启动后端服务...")
    backend_process = subprocess.Popen(
        ["uvicorn", "app.main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"],
        cwd=str(BACKEND_DIR),
        shell=True
    )
    return backend_process

def main():
    print("=" * 60)
    print("🎓 CertMaster 启动中...")
    print("=" * 60)
    
    # 检查依赖
    if not check_dependencies():
        sys.exit(1)
    
    try:
        # 启动服务
        backend = start_backend()
        time.sleep(2)  # 等待后端启动
        frontend = start_frontend()
        
        print("\n" + "=" * 60)
        print("✅ 服务启动成功！")
        print("=" * 60)
        print("📍 前端: http://localhost:3000")
        print("📍 后端: http://localhost:8000")
        print("📍 API 文档: http://localhost:8000/api/docs")
        print("=" * 60)
        print("\n按 Ctrl+C 停止服务...")
        
        # 等待进程
        frontend.wait()
        backend.wait()
        
    except KeyboardInterrupt:
        print("\n\n🛑 正在停止服务...")
        frontend.terminate()
        backend.terminate()
        print("✅ 服务已停止")
    except Exception as e:
        print(f"\n❌ 启动失败: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()

