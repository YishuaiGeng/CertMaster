# 🐳 Docker 部署指南

## 📋 目录
- [环境要求](#环境要求)
- [快速开始](#快速开始)
- [详细说明](#详细说明)
- [常用命令](#常用命令)
- [故障排查](#故障排查)

---

## 🖥️ 环境要求

### 必需软件
- **Docker Desktop** 20.10+ 
  - Windows: [下载地址](https://www.docker.com/products/docker-desktop)
  - Mac: [下载地址](https://www.docker.com/products/docker-desktop)
  - Linux: [安装指南](https://docs.docker.com/engine/install/)
- **Docker Compose** 2.0+ (通常随 Docker Desktop 自动安装)

### 硬件要求
- **内存**: 至少 4GB RAM
- **硬盘**: 至少 2GB 可用空间
- **CPU**: 支持虚拟化

---

## 🚀 快速开始

### Windows 用户

1. **安装 Docker Desktop**
   - 下载并安装 Docker Desktop for Windows
   - 启动 Docker Desktop
   - 等待 Docker 引擎启动完成

2. **运行部署脚本**
   ```bash
   双击运行 docker-start.bat
   ```

3. **访问应用**
   - 前端: http://localhost
   - 后端: http://localhost:8000
   - API 文档: http://localhost:8000/api/docs

### Linux/Mac 用户

1. **安装 Docker**
   ```bash
   # Ubuntu/Debian
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   
   # 添加当前用户到 docker 组
   sudo usermod -aG docker $USER
   ```

2. **运行部署脚本**
   ```bash
   chmod +x docker-start.sh
   ./docker-start.sh
   ```

3. **访问应用**
   - 前端: http://localhost
   - 后端: http://localhost:8000

---

## 📖 详细说明

### 架构说明

```
┌─────────────────┐
│   浏览器         │
└────────┬────────┘
         │
    ┌────▼─────────────┐
    │  Nginx (前端)    │ :80
    │  - 静态文件服务   │
    │  - API 反向代理   │
    └────┬─────────────┘
         │
    ┌────▼─────────────┐
    │  FastAPI (后端)  │ :8000
    │  - REST API      │
    │  - 数据处理       │
    └──────────────────┘
         │
    ┌────▼─────────────┐
    │  数据卷 (data/)  │
    │  - 证书数据       │
    │  - 模板配置       │
    └──────────────────┘
```

### 容器说明

#### 前端容器 (certmaster-frontend)
- **基础镜像**: nginx:alpine
- **端口**: 80
- **功能**: 
  - 提供静态文件服务
  - 反向代理 API 请求到后端
  - SPA 路由支持

#### 后端容器 (certmaster-backend)
- **基础镜像**: python:3.10-slim
- **端口**: 8000
- **功能**:
  - REST API 服务
  - 证书数据处理
  - 文件存储管理

### 数据持久化

数据通过 Docker 卷映射保存在宿主机：
```yaml
volumes:
  - ./data:/app/data  # 证书和配置数据
```

---

## 🔧 常用命令

### 启动服务

```bash
# 使用脚本（推荐）
# Windows
docker-start.bat

# Linux/Mac
./docker-start.sh

# 或手动启动
docker-compose up -d
```

### 停止服务

```bash
docker-compose down
```

### 重启服务

```bash
docker-compose restart
```

### 查看日志

```bash
# 查看所有服务日志
docker-compose logs -f

# 查看前端日志
docker-compose logs -f frontend

# 查看后端日志
docker-compose logs -f backend
```

### 重新构建

```bash
# 重新构建所有镜像
docker-compose build

# 重新构建并启动
docker-compose up -d --build

# 重新构建指定服务
docker-compose build backend
```

### 进入容器

```bash
# 进入后端容器
docker-compose exec backend sh

# 进入前端容器
docker-compose exec frontend sh
```

### 查看容器状态

```bash
docker-compose ps
```

### 清理资源

```bash
# 停止并删除容器
docker-compose down

# 同时删除卷（⚠️ 会删除数据）
docker-compose down -v

# 清理未使用的镜像
docker image prune -a
```

---

## ❓ 故障排查

### 问题 1: Docker Desktop 无法启动

**症状**: Docker Desktop 一直显示 "Starting..."

**解决方案**:
1. 确保已启用 Windows WSL 2 功能
2. 确保虚拟化已在 BIOS 中启用
3. 重启电脑
4. 重新安装 Docker Desktop

### 问题 2: 端口被占用

**症状**: `Error: bind: address already in use`

**解决方案**:
```bash
# 查找占用端口的进程
# Windows
netstat -ano | findstr :80
netstat -ano | findstr :8000

# Linux/Mac
lsof -i :80
lsof -i :8000

# 修改 docker-compose.yml 中的端口映射
ports:
  - "8080:80"    # 改为 8080
  - "8001:8000"  # 改为 8001
```

### 问题 3: 容器无法启动

**症状**: 容器状态为 `Exited`

**解决方案**:
```bash
# 查看容器日志
docker-compose logs backend
docker-compose logs frontend

# 重新构建
docker-compose build --no-cache
docker-compose up -d
```

### 问题 4: 前端无法访问后端

**症状**: API 请求失败，Network Error

**解决方案**:
1. 检查容器网络配置
   ```bash
   docker network ls
   docker network inspect certmaster-network
   ```

2. 确认容器间可以通信
   ```bash
   docker-compose exec frontend ping backend
   ```

3. 检查 nginx 配置中的代理设置

### 问题 5: 数据丢失

**症状**: 重启后证书数据丢失

**解决方案**:
1. 检查数据卷映射
   ```bash
   docker volume ls
   ```

2. 确认 `./data` 目录存在且有读写权限
   ```bash
   ls -la ./data
   ```

3. 备份数据
   ```bash
   # 从容器复制数据到宿主机
   docker cp certmaster-backend:/app/data ./data-backup
   ```

### 问题 6: 镜像构建失败

**症状**: `ERROR: failed to solve`

**解决方案**:
```bash
# 清理 Docker 缓存
docker builder prune -a

# 使用 --no-cache 重新构建
docker-compose build --no-cache

# 检查 Dockerfile 语法
docker-compose config
```

---

## 🔐 生产环境部署

### 安全建议

1. **使用环境变量**
   ```yaml
   # docker-compose.yml
   environment:
     - SECRET_KEY=${SECRET_KEY}
     - DATABASE_URL=${DATABASE_URL}
   ```

2. **启用 HTTPS**
   - 使用 Let's Encrypt 证书
   - 配置 nginx SSL

3. **限制资源使用**
   ```yaml
   services:
     backend:
       deploy:
         resources:
           limits:
             cpus: '1'
             memory: 512M
   ```

4. **健康检查**
   ```yaml
   services:
     backend:
       healthcheck:
         test: ["CMD", "curl", "-f", "http://localhost:8000/api/health"]
         interval: 30s
         timeout: 10s
         retries: 3
   ```

### 备份策略

```bash
# 定期备份数据
docker run --rm -v certmaster_data:/data -v $(pwd):/backup \
  alpine tar czf /backup/certmaster-backup-$(date +%Y%m%d).tar.gz /data
```

---

## 📝 配置文件说明

### docker-compose.yml
- 定义服务、网络、卷
- 配置端口映射
- 设置环境变量

### Dockerfile (backend)
- Python 后端镜像构建
- 安装依赖
- 配置启动命令

### Dockerfile (frontend)
- 多阶段构建
- 第一阶段：构建前端资源
- 第二阶段：部署到 nginx

### nginx.conf
- 静态文件服务配置
- API 反向代理
- Gzip 压缩
- 缓存策略

---

## 🔄 更新部署

```bash
# 拉取最新代码
git pull

# 重新构建并启动
docker-compose up -d --build

# 或使用脚本
./docker-start.sh  # Linux/Mac
docker-start.bat   # Windows
```

---

## 📞 技术支持

遇到问题？
1. 查看容器日志: `docker-compose logs -f`
2. 检查容器状态: `docker-compose ps`
3. 查看本文档的[故障排查](#故障排查)部分
4. 提交 Issue

---

<div align="center">

**使用 Docker 让部署更简单！** 🐳

[⬆ 回到顶部](#-docker-部署指南)

</div>

