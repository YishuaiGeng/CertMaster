# 🎓 CertMaster - 证书制作系统

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
