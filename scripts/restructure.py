#!/usr/bin/env python3
"""
项目重构脚本 - 将现有项目重构为新的目录结构
"""
import os
import shutil
import json
from pathlib import Path

# 项目根目录
ROOT_DIR = Path(__file__).parent.parent

print("=" * 60)
print("[重构] 开始重构 CertMaster 项目...")
print("=" * 60)

# 步骤 1: 创建新的目录结构
print("\n[步骤 1] 创建新目录结构...")

directories = [
    "frontend",
    "frontend/src",
    "frontend/public",
    "data",
    "data/certificates",
    "data/configs",
    "data/templates",
    "docs"
]

for dir_name in directories:
    dir_path = ROOT_DIR / dir_name
    dir_path.mkdir(parents=True, exist_ok=True)
    print(f"  [OK] 创建目录: {dir_name}")

# 步骤 2: 移动前端代码到 frontend/
print("\n[步骤 2] 移动前端代码到 frontend/...")

frontend_files = [
    "src",
    "public",
    "index.html",
    "package.json",
    "package-lock.json",
    "vite.config.ts",
    "tsconfig.json",
    "tsconfig.node.json",
    "tailwind.config.js",
    "postcss.config.js"
]

for item in frontend_files:
    src = ROOT_DIR / item
    dst = ROOT_DIR / "frontend" / item
    
    if src.exists():
        if dst.exists():
            if dst.is_dir():
                shutil.rmtree(dst)
            else:
                dst.unlink()
        
        if src.is_dir():
            shutil.copytree(src, dst)
        else:
            shutil.copy2(src, dst)
        print(f"  [OK] 移动: {item} -> frontend/{item}")
    else:
        print(f"  [SKIP] 跳过: {item} (不存在)")

# 步骤 3: 移动数据到 data/
print("\n[步骤 3] 移动数据到 data/...")

# 从 server/data 移动数据
server_data_dir = ROOT_DIR / "server" / "data"
if server_data_dir.exists():
    # 移动证书
    src_certs = server_data_dir / "certificates"
    dst_certs = ROOT_DIR / "data" / "certificates"
    if src_certs.exists():
        for cert_file in src_certs.glob("*.png"):
            shutil.copy2(cert_file, dst_certs / cert_file.name)
            print(f"  [OK] 移动证书: {cert_file.name}")
    
    # 移动配置
    src_configs = server_data_dir / "configs"
    dst_configs = ROOT_DIR / "data" / "configs"
    if src_configs.exists():
        for config_file in src_configs.glob("*.json"):
            shutil.copy2(config_file, dst_configs / config_file.name)
            print(f"  [OK] 移动配置: {config_file.name}")
    
    # 移动 JSON 文件
    for json_file in ["certificates.json", "templates.json"]:
        src_json = server_data_dir / json_file
        dst_json = ROOT_DIR / "data" / json_file
        if src_json.exists():
            shutil.copy2(src_json, dst_json)
            print(f"  [OK] 移动数据: {json_file}")

# 步骤 4: 移动文档到 docs/
print("\n[步骤 4] 移动文档到 docs/...")

doc_files = [
    "DEPLOYMENT.md",
    "START.md",
    "WHY_TWO_NODE_MODULES.md",
    "PROJECT_RESTRUCTURE.md"
]

for doc_file in doc_files:
    src = ROOT_DIR / doc_file
    dst = ROOT_DIR / "docs" / doc_file
    if src.exists():
        shutil.copy2(src, dst)
        print(f"  [OK] 移动文档: {doc_file}")

# 步骤 5: 更新 frontend/package.json
print("\n[步骤 5] 更新 frontend/package.json...")

frontend_package_json = ROOT_DIR / "frontend" / "package.json"
if frontend_package_json.exists():
    with open(frontend_package_json, 'r', encoding='utf-8') as f:
        package_data = json.load(f)
    
    # 更新脚本（移除后端相关脚本）
    if "scripts" in package_data:
        package_data["scripts"].pop("dev:server", None)
        package_data["scripts"].pop("dev:all", None)
        package_data["scripts"].pop("install:server", None)
        package_data["scripts"].pop("start:server", None)
    
    # 移除 concurrently 依赖
    if "devDependencies" in package_data:
        package_data["devDependencies"].pop("concurrently", None)
    
    with open(frontend_package_json, 'w', encoding='utf-8') as f:
        json.dump(package_data, f, indent=2, ensure_ascii=False)
    
    print("  [OK] 更新 frontend/package.json")

# 步骤 6: 创建根目录的 README.md
print("\n[步骤 6] 创建新的 README.md...")

readme_content = """# 🎓 CertMaster - 证书制作系统

一个基于 Web 的专业证书制作系统，支持自定义模板、字段配置、实时预览和批量生成。

## 🏗️ 项目结构

```
CertMaster/
├── frontend/           # 前端 (React + Vite + TypeScript)
├── backend/            # 后端 (FastAPI + Python)
├── data/               # 数据存储
├── docs/               # 文档
├── scripts/            # 脚本
└── README.md
```

## 🚀 快速开始

### 1. 安装依赖

**前端：**
```bash
cd frontend
npm install
```

**后端：**
```bash
cd backend
pip install -r requirements.txt
```

### 2. 启动服务

**使用启动脚本（推荐）：**
```bash
python scripts/start.py
```

**手动启动：**

终端 1 - 前端：
```bash
cd frontend
npm run dev
```

终端 2 - 后端：
```bash
cd backend
uvicorn app.main:app --reload
```

### 3. 访问应用

- **前端**: http://localhost:3000
- **后端 API**: http://localhost:8000
- **API 文档**: http://localhost:8000/api/docs

## 📚 文档

- [API 文档](docs/API.md)
- [部署指南](docs/DEPLOYMENT.md)
- [开发指南](docs/DEVELOPMENT.md)

## 🛠️ 技术栈

### 前端
- React 18
- TypeScript
- Vite
- TailwindCSS

### 后端
- Python 3.11+
- FastAPI
- Uvicorn
- Pydantic

## ✨ 功能特点

- ✅ 可视化证书编辑
- ✅ 模板管理系统
- ✅ 拖拽式字段配置
- ✅ 实时预览
- ✅ 配置持久化
- ✅ 证书存储管理
- ✅ 自动文件命名
- ✅ API 自动文档

## 📝 许可证

MIT
"""

with open(ROOT_DIR / "README.md", 'w', encoding='utf-8') as f:
    f.write(readme_content)

print("  [OK] 创建 README.md")

# 步骤 7: 创建 .gitignore
print("\n[步骤 7] 更新 .gitignore...")

gitignore_content = """# Dependencies
node_modules/
__pycache__/
*.py[cod]

# Build
dist/
build/
*.egg-info/

# Environment
.env
.env.local
venv/
env/

# IDE
.vscode/
.idea/
*.swp

# Data (可选：如果不想提交数据)
# data/certificates/
# data/configs/

# Logs
*.log

# OS
.DS_Store
Thumbs.db
"""

with open(ROOT_DIR / ".gitignore", 'w', encoding='utf-8') as f:
    f.write(gitignore_content)

print("  [OK] 更新 .gitignore")

# 完成
print("\n" + "=" * 60)
print("[完成] 项目重构完成！")
print("=" * 60)
print("\n下一步操作：")
print("  1. cd frontend && npm install")
print("  2. cd backend && pip install -r requirements.txt")
print("  3. python scripts/start.py")
print("\n提示：重构完成后，可以删除以下旧文件/文件夹：")
print("  - server/")
print("  - 根目录下的前端文件（src/, public/, index.html等）")
print("  - 根目录下的 node_modules/")
print("\n使用命令：python scripts/cleanup.py")
print("=" * 60)

