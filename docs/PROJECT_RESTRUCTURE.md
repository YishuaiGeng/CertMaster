# 🔄 项目重构计划

## 新的目录结构

```
CertMaster/
├── frontend/                   # 前端应用 (React + Vite + TypeScript)
│   ├── src/
│   │   ├── components/
│   │   ├── utils/
│   │   ├── types.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   │   └── templates/         # 模板文件
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── backend/                    # 后端应用 (FastAPI + Python)
│   ├── app/
│   │   ├── api/               # API 路由
│   │   ├── models/            # 数据模型
│   │   ├── services/          # 业务逻辑
│   │   ├── config.py          # 配置
│   │   └── main.py            # 入口文件
│   ├── requirements.txt       # Python 依赖
│   └── README.md
│
├── data/                       # 数据存储（统一管理）
│   ├── certificates/          # 证书图片
│   ├── configs/               # 模板配置
│   ├── templates/             # 用户上传的模板
│   ├── certificates.json      # 证书元数据
│   └── templates.json         # 模板元数据
│
├── docs/                       # 文档
│   ├── API.md                 # API 文档
│   ├── DEPLOYMENT.md          # 部署指南
│   └── DEVELOPMENT.md         # 开发指南
│
├── scripts/                    # 脚本
│   ├── start.sh               # 启动脚本 (Linux/Mac)
│   └── start.bat              # 启动脚本 (Windows)
│
├── .gitignore
├── README.md
└── docker-compose.yml         # Docker 编排（可选）
```

## 技术栈变更

### 前端（不变）
- React 18
- TypeScript
- Vite
- TailwindCSS
- Lucide React

### 后端（更改）
- ~~Node.js + Express~~ → **Python + FastAPI**
- ~~Multer~~ → **Python-multipart**
- ~~CORS (npm)~~ → **FastAPI CORS middleware**

## 主要优势

### 为什么选择 FastAPI？

1. **性能优异** - 与 Node.js 相当，基于 Starlette 和 Pydantic
2. **自动文档** - 自动生成 Swagger UI 和 ReDoc
3. **类型检查** - 原生支持类型提示
4. **异步支持** - 完整的 async/await 支持
5. **数据验证** - Pydantic 自动验证请求数据
6. **易于部署** - 可以用 Uvicorn, Gunicorn, Docker 等

## 数据存储策略

### 统一数据目录 `data/`

```
data/
├── certificates/              # 证书图片文件
│   └── 张三_研究性学习_2025-10-01_xxx.png
│
├── configs/                   # 模板配置（JSON）
│   └── template_config_cert_001.json
│
├── templates/                 # 用户上传的模板
│   ├── user_cert_xxx.png
│   └── user_stamp_xxx.png
│
├── certificates.json          # 证书元数据
├── templates.json             # 模板元数据
└── backups/                   # 备份（可选）
```

## API 端点对比

### Express (旧)
```
POST   /api/certificates
GET    /api/certificates
DELETE /api/certificates/:id
POST   /api/configs/:id
GET    /api/configs
```

### FastAPI (新)
```
POST   /api/v1/certificates
GET    /api/v1/certificates
DELETE /api/v1/certificates/{id}
POST   /api/v1/configs/{template_id}
GET    /api/v1/configs
```

**新增功能：**
- `GET /api/v1/docs` - 自动生成的 API 文档
- `GET /api/v1/health` - 健康检查
- `GET /api/v1/stats` - 统计信息

## 启动方式

### 旧方式
```bash
npm run dev:all
```

### 新方式
```bash
# 使用脚本（推荐）
python scripts/start.py

# 或手动启动
cd frontend && npm run dev &
cd backend && uvicorn app.main:app --reload
```

## 迁移步骤

1. ✅ 创建新目录结构
2. ✅ 移动前端代码到 `frontend/`
3. ✅ 创建 FastAPI 后端
4. ✅ 迁移数据到 `data/`
5. ✅ 更新前端 API 调用
6. ✅ 更新文档
7. ✅ 测试所有功能
8. ✅ 删除旧代码

## 兼容性

- **数据兼容** - 完全兼容现有数据（certificates.json, configs）
- **API 兼容** - 接口保持一致，只是实现语言改变
- **功能兼容** - 所有功能保持不变

## 后续优化

- [ ] 添加 Docker 支持
- [ ] 添加数据库（SQLite/PostgreSQL）
- [ ] 添加用户认证
- [ ] 添加批量生成功能
- [ ] 添加证书模板在线编辑器

