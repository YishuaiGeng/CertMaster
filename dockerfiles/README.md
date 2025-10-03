# 🐳 Docker 部署文件说明

本文件夹包含所有 Docker 部署和推送相关的脚本和配置文件。

## 📁 文件列表

| 文件 | 说明 |
|------|------|
| `单镜像构建.bat` | 构建单体 Docker 镜像 (certmaster:latest) |
| `推送到DockerHub.bat` | 推送镜像到 Docker Hub (ysgeng/certmaster) |
| `从DockerHub运行.bat` | 从 Docker Hub 拉取并运行镜像 |
| `构建命令.bat` | 构建多服务 Docker 镜像（前后端分离） |
| `docker-镜像加速配置.txt` | Docker 镜像加速器配置说明 |

## 🚀 快速使用指南

### 方案一：从 Docker Hub 拉取运行（推荐给使用者）

**最简单的方式**，无需构建，直接从云端拉取：

```bash
# 双击运行
从DockerHub运行.bat

# 或手动执行
docker pull ysgeng/certmaster:latest
docker run -d -p 8000:8000 --name certmaster --restart unless-stopped ysgeng/certmaster:latest
```

访问：http://localhost:8000

---

### 方案二：本地构建镜像（推荐给开发者）

**适用于修改代码后需要重新构建的场景**：

#### 1. 构建单体镜像
```bash
# 双击运行
单镜像构建.bat

# 或手动执行
cd ..
docker build -t certmaster:latest -f Dockerfile .
```

#### 2. 推送到 Docker Hub（可选）
```bash
# 双击运行
推送到DockerHub.bat

# 或手动执行
docker login
docker tag certmaster:latest ysgeng/certmaster:latest
docker push ysgeng/certmaster:latest
```

---

### 方案三：多服务构建（高级用户）

如果需要前后端分离部署：

```bash
# 双击运行
构建命令.bat

# 或使用 Docker Compose
docker-compose -f docker-compose.yml build
```

---

## 📦 Docker Hub 镜像信息

| 信息 | 内容 |
|------|------|
| **镜像地址** | `ysgeng/certmaster:latest` |
| **Docker Hub** | https://hub.docker.com/r/ysgeng/certmaster |
| **用户名** | ysgeng |
| **项目名** | certmaster |

---

## 💡 常用命令

### 镜像管理
```bash
# 查看本地镜像
docker images | findstr certmaster

# 删除本地镜像
docker rmi certmaster:latest
docker rmi ysgeng/certmaster:latest

# 拉取最新镜像
docker pull ysgeng/certmaster:latest
```

### 容器管理
```bash
# 查看运行中的容器
docker ps

# 查看所有容器
docker ps -a

# 查看日志
docker logs certmaster

# 进入容器
docker exec -it certmaster bash

# 停止容器
docker stop certmaster

# 启动容器
docker start certmaster

# 重启容器
docker restart certmaster

# 删除容器
docker rm -f certmaster
```

---

## 🔧 数据持久化

如果需要在容器外部管理数据（模板、配置、证书）：

```bash
# Windows
docker run -d -p 8000:8000 ^
  --name certmaster ^
  --restart unless-stopped ^
  -v D:/CertMaster/data:/app/backend/data ^
  ysgeng/certmaster:latest

# Linux/Mac
docker run -d -p 8000:8000 \
  --name certmaster \
  --restart unless-stopped \
  -v ~/CertMaster/data:/app/backend/data \
  ysgeng/certmaster:latest
```

---

## ⚙️ 镜像加速器

如果拉取镜像速度慢，请参考 `docker-镜像加速配置.txt` 配置镜像加速器。

---

## 📖 详细文档

更多信息请查看：
- **主项目 README**: [../README.md](../README.md)
- **Docker 部署指南**: README.md 中的"Docker 部署"章节

---

**注意**: 
- 单体镜像 Dockerfile 位于: `../Dockerfile`
- 多服务 Dockerfile 位于:
  - 后端: `../backend/Dockerfile`
  - 前端: `../frontend/Dockerfile`

