# CertMaster 后端服务 (FastAPI)

基于 FastAPI 构建的高性能证书管理后端服务。

## 🚀 快速开始

### 安装依赖

```bash
cd backend
pip install -r requirements.txt
```

### 启动服务

**开发模式（自动重载）：**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**生产模式：**
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### 访问 API 文档

启动后访问：
- **Swagger UI**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc

## 📡 API 端点

### 健康检查
- `GET /api/health` - 服务健康状态

### 证书管理
- `GET /api/v1/certificates` - 获取所有证书
- `POST /api/v1/certificates` - 保存证书
- `DELETE /api/v1/certificates/{id}` - 删除证书

### 配置管理
- `GET /api/v1/configs` - 获取所有配置
- `POST /api/v1/configs/{template_id}` - 保存配置
- `GET /api/v1/configs/export` - 导出配置
- `POST /api/v1/configs/import` - 导入配置

### 模板管理
- `GET /api/v1/templates` - 获取模板列表
- `POST /api/v1/templates` - 保存模板
- `DELETE /api/v1/templates/{id}` - 删除模板

### 统计信息
- `GET /api/v1/stats` - 获取系统统计

## 📁 数据存储

数据存储在项目根目录的 `data/` 文件夹：

```
data/
├── certificates/          # 证书图片
├── configs/               # 模板配置
├── templates/             # 用户模板
├── certificates.json      # 证书元数据
└── templates.json         # 模板元数据
```

## 🔧 配置

在 `app/main.py` 中修改：

```python
# 数据目录
DATA_DIR = Path("../data")

# CORS 配置
allow_origins=["http://localhost:3000"]

# 服务器端口
uvicorn.run(app, host="0.0.0.0", port=8000)
```

## 🐛 开发

### 项目结构

```
backend/
├── app/
│   ├── main.py            # 主应用
│   ├── models.py          # 数据模型（可扩展）
│   ├── api/               # API 路由（可扩展）
│   └── services/          # 业务逻辑（可扩展）
├── requirements.txt       # 依赖
└── README.md
```

### 添加新的 API 端点

1. 在 `app/main.py` 中添加路由函数
2. 使用 Pydantic 模型定义请求/响应
3. FastAPI 会自动生成文档

### 日志

日志输出到控制台，生产环境建议配置日志文件。

## 🌐 部署

### 使用 Uvicorn

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### 使用 Gunicorn + Uvicorn

```bash
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
```

### 使用 Docker

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 📊 性能

FastAPI 基于 Starlette 和 Pydantic，性能优异：

- 异步支持
- 自动数据验证
- 类型检查
- 并发处理

## 🔒 安全建议

生产环境部署时：

1. 添加身份认证（JWT）
2. 限制 CORS 来源
3. 添加请求速率限制
4. 使用 HTTPS
5. 添加日志记录
6. 配置环境变量

## 📝 许可证

MIT

