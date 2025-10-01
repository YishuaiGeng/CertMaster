# 🚀 CertMaster 快速开始指南

## ✅ 项目已重构完成！

新的项目结构：
```
CertMaster/
├── frontend/           # React + Vite 前端
├── backend/            # FastAPI 后端  
├── data/               # 数据存储
├── docs/               # 文档
└── scripts/            # 脚本
```

---

## 📦 第一步：安装依赖

### 安装 Python 后端依赖

```bash
cd backend
pip install -r requirements.txt
cd ..
```

### 安装 Node.js 前端依赖

```bash
cd frontend
npm install
cd ..
```

---

## 🎯 第二步：启动服务

### 方式一：使用启动脚本（推荐）

```bash
python scripts/start.py
```

### 方式二：手动启动

**终端 1 - 启动后端：**
```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**终端 2 - 启动前端：**
```bash
cd frontend
npm run dev
```

---

## 🌐 第三步：访问应用

- **前端界面**: http://localhost:3000
- **后端 API**: http://localhost:8000  
- **API 文档**: http://localhost:8000/api/docs

---

## 📊 主要变更

| 项目 | 旧 | 新 |
|------|---|---|
| **后端** | Node.js + Express | Python + FastAPI |
| **端口** | 3001 | 8000 |
| **API 路径** | /api/* | /api/v1/* |
| **前端位置** | 根目录 | frontend/ |
| **数据存储** | server/data/ | data/ |
| **API 文档** | ❌ 无 | ✅ 自动生成 |

---

## ✨ 新功能

### 1. 自动 API 文档

访问 http://localhost:8000/api/docs 查看完整的交互式 API 文档

### 2. 统一数据管理

所有数据存储在 `data/` 目录：
- `data/certificates/` - 证书图片
- `data/configs/` - 模板配置
- `data/certificates.json` - 证书元数据
- `data/templates.json` - 模板元数据

### 3. 改进的类型安全

FastAPI 使用 Pydantic 进行自动数据验证

---

## 🧪 测试功能

### 1. 创建证书

1. 打开 http://localhost:3000
2. 填写证书信息
3. 选择模板
4. 点击"保存证书"
5. 查看 `data/certificates/` 目录

### 2. 查看我的证书

点击右上角"我的证书"按钮

### 3. 编辑模板配置

1. 点击"模板管理"
2. 选择证书模板
3. 点击任意模板进入编辑器
4. 修改字段配置
5. 点击"保存配置"
6. 配置保存到 `data/configs/`

### 4. 测试 API

访问 http://localhost:8000/api/docs

尝试：
- GET /api/v1/certificates - 获取证书列表
- GET /api/health - 健康检查

---

## 🗑️ 清理旧文件（可选）

确认一切正常后，删除旧文件：

```bash
python scripts/cleanup.py
```

这会删除：
- `server/` 目录
- 根目录下的旧前端文件
- 根目录下的 `node_modules/`

---

## 🐛 故障排除

### 前端无法连接后端

**检查：**
```bash
# 测试后端是否运行
curl http://localhost:8000/api/health
```

**应该返回：**
```json
{
  "status": "ok",
  "timestamp": "...",
  "version": "2.0.0"
}
```

### Python 依赖安装失败

**使用虚拟环境：**
```bash
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac
pip install -r backend/requirements.txt
```

### 端口被占用

**Windows：**
```bash
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

**Linux/Mac：**
```bash
lsof -ti:8000 | xargs kill -9
```

---

## 📚 更多文档

- **API 文档**: http://localhost:8000/api/docs
- **重构指南**: `RESTRUCTURE_GUIDE.md`
- **后端文档**: `backend/README.md`
- **部署指南**: `docs/DEPLOYMENT.md`

---

## 🎉 完成！

现在您可以：

✅ 使用更强大的 FastAPI 后端  
✅ 查看自动生成的 API 文档  
✅ 享受统一的数据管理  
✅ 获得更好的开发体验

**有问题？查看 `docs/` 目录下的其他文档。**

---

**Happy Coding! 🚀**

