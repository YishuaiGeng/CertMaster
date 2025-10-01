# 🚀 CertMaster 部署指南

本文档介绍如何部署和运行 CertMaster 证书制作系统（前端 + 后端）。

---

## 📦 系统架构

```
CertMaster/
├── 前端（React + Vite）          → http://localhost:5173
└── 后端（Node.js + Express）     → http://localhost:3001
```

**技术栈：**
- **前端**：React 18 + TypeScript + TailwindCSS + Vite
- **后端**：Node.js + Express
- **存储**：文件系统（JSON + 图片文件）

---

## 🛠️ 安装步骤

### 1. 安装前端依赖
```bash
npm install
```

### 2. 安装后端依赖
```bash
npm run install:server
```

或手动安装：
```bash
cd server
npm install
cd ..
```

---

## 🚀 启动方式

### 方式一：同时启动前后端（推荐）

```bash
npm run dev:all
```

这会同时启动：
- ✅ 前端开发服务器：http://localhost:5173
- ✅ 后端 API 服务：http://localhost:3001

### 方式二：分别启动

**启动前端（终端 1）：**
```bash
npm run dev
```

**启动后端（终端 2）：**
```bash
npm run dev:server
```

### 方式三：仅启动前端（使用 LocalStorage）

```bash
npm run dev
```

> 注意：不启动后端时，证书和配置只保存在浏览器 LocalStorage 中，刷新不会丢失，但无法导出为文件。

---

## 📁 数据存储说明

### 后端启动后的存储结构

```
server/
└── data/
    ├── certificates/          # 📜 证书图片存储
    │   ├── 张三_优秀员工_2025-01-15_1234567890.png
    │   └── 李四_培训证书_2025-01-15_1234567891.png
    │
    ├── configs/               # ⚙️ 模板配置文件
    │   ├── template_config_cert_001.json
    │   └── template_config_cert_002.json
    │
    ├── certificates.json      # 证书元数据列表
    └── templates.json         # 用户上传的模板列表
```

### 文件命名规则

**证书文件名格式：**
```
{姓名}_{证书标题}_{日期}_{时间戳}.png
```

**示例：**
- `张三_优秀员工证书_2025-01-15_1705298400000.png`
- `李四_培训结业证书_2025-01-15_1705298500000.png`

**特殊字符处理：**
- 非法字符（空格、斜杠等）自动替换为 `_`
- 中文字符保留

---

## 🔄 数据迁移

### 从 LocalStorage 迁移到后端

如果您之前使用的是纯前端版本（数据在 LocalStorage），启动后端后：

1. **模板配置自动迁移**：
   - 打开模板管理
   - 点击"导出配置"
   - 后端启动后，点击"导入配置"

2. **证书需要重新保存**：
   - 打开"我的证书"
   - 逐个打开证书
   - 点击"保存证书"（会自动保存到后端）

---

## 🌐 API 端点

后端服务提供以下 API：

### 证书管理
- `GET    /api/certificates` - 获取所有证书
- `POST   /api/certificates` - 保存证书
- `DELETE /api/certificates/:id` - 删除证书

### 配置管理
- `GET    /api/configs` - 获取所有配置
- `POST   /api/configs/:templateId` - 保存配置
- `GET    /api/configs/export` - 导出配置
- `POST   /api/configs/import` - 导入配置

### 模板管理
- `GET    /api/templates` - 获取模板列表
- `POST   /api/templates` - 保存模板
- `DELETE /api/templates/:id` - 删除模板

### 健康检查
- `GET    /api/health` - 检查服务状态

---

## ⚙️ 配置选项

### 修改后端端口

编辑 `server/index.js`：
```javascript
const PORT = 3001; // 改为你想要的端口
```

同时修改 `src/utils/api.ts`：
```typescript
const API_BASE_URL = 'http://localhost:3001/api'; // 对应修改
```

### 修改前端端口

编辑 `vite.config.ts`：
```typescript
export default defineConfig({
  server: {
    port: 5173, // 改为你想要的端口
  },
});
```

---

## 🐛 常见问题

### 1. 后端启动失败

**错误：`Error: Cannot find module 'express'`**

**解决：**
```bash
cd server
npm install
```

### 2. 前端无法连接后端

**错误：`Failed to fetch` 或 CORS 错误**

**检查：**
1. 后端是否正常启动（访问 http://localhost:3001/api/health）
2. 端口是否被占用
3. 防火墙是否阻止连接

**解决：**
```bash
# 重启后端
npm run dev:server
```

### 3. 证书保存失败

**错误：`保存证书失败`**

**检查：**
1. `server/data` 目录是否有写权限
2. 磁盘空间是否充足
3. 后端日志输出

### 4. 文件名乱码

**原因：** Windows 系统文件名编码问题

**解决：** 后端会自动处理，特殊字符替换为 `_`

---

## 📊 生产环境部署

### 1. 构建前端

```bash
npm run build
```

生成的文件在 `dist/` 目录。

### 2. 部署前端

**使用 Nginx：**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    root /path/to/certmaster/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 3. 使用 PM2 管理后端

```bash
# 安装 PM2
npm install -g pm2

# 启动后端
cd server
pm2 start index.js --name certmaster-api

# 查看状态
pm2 status

# 查看日志
pm2 logs certmaster-api

# 设置开机自启
pm2 startup
pm2 save
```

### 4. 安全建议

⚠️ **生产环境必做：**
1. 添加身份验证（JWT 或 Session）
2. 限制 CORS 来源
3. 使用 HTTPS
4. 添加请求速率限制
5. 定期备份 `server/data` 目录
6. 添加日志记录
7. 文件上传大小限制和类型验证

---

## 🔄 备份和恢复

### 备份数据

```bash
# 备份整个数据目录
cp -r server/data server/data-backup-$(date +%Y%m%d)
```

### 恢复数据

```bash
# 恢复数据
cp -r server/data-backup-20250115 server/data
```

### 自动备份脚本（Linux/Mac）

创建 `backup.sh`：
```bash
#!/bin/bash
BACKUP_DIR="backups"
DATE=$(date +%Y%m%d-%H%M%S)
mkdir -p $BACKUP_DIR
tar -czf $BACKUP_DIR/data-$DATE.tar.gz server/data
echo "✅ 备份完成: $BACKUP_DIR/data-$DATE.tar.gz"
```

---

## 📝 开发指南

### 添加新的 API 端点

1. 在 `server/index.js` 添加路由
2. 在 `src/utils/api.ts` 添加调用函数
3. 在前端组件中使用

### 修改存储结构

编辑 `server/index.js` 中的路径常量：
```javascript
const CERTIFICATES_DIR = path.join(DATA_DIR, 'certificates');
const CONFIGS_DIR = path.join(DATA_DIR, 'configs');
```

---

## 📞 技术支持

如有问题，请检查：
1. 浏览器控制台（F12）
2. 后端终端日志
3. `server/data` 目录权限

---

**祝您使用愉快！** 🎉

