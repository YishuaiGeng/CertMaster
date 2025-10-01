# 🎉 CertMaster 启动指南

## 📦 首次使用

### 第一步：安装所有依赖

```bash
# 在项目根目录执行

# 1. 安装前端依赖
npm install

# 2. 安装后端依赖
npm run install:server
```

等待安装完成...

---

### 第二步：启动系统

**🚀 推荐方式：同时启动前后端**

```bash
npm run dev:all
```

这会同时启动：
- ✅ 前端服务：http://localhost:5173
- ✅ 后端服务：http://localhost:3001

---

**或者分别启动：**

**终端 1：启动前端**
```bash
npm run dev
```

**终端 2：启动后端**
```bash
npm run dev:server
```

---

## ✨ 验证系统

### 1. 打开浏览器

访问：**http://localhost:5173**

### 2. 创建第一张证书

1. 填写姓名：`张三`
2. 填写证书内容：`在本次活动中表现优异`
3. 选择证书模板
4. 选择盖章模板
5. 点击"保存证书"

### 3. 检查文件是否保存

打开文件夹：`server/data/certificates/`

应该能看到类似这样的文件：
```
张三_研究性学习成果课题_2025-10-01_1727780400000.png
```

---

## 🎯 快速测试功能

### 1. 证书编号随机生成
- 点击"证书编号"旁边的"随机"按钮
- 自动生成 8 位数字编号

### 2. 模板编辑器
1. 点击右上角"模板管理"
2. 选择"证书模板"标签
3. 点击任意模板图片进入编辑器
4. 拖动红色定位线调整字段位置
5. 点击"保存配置"

### 3. 预设内容
- 在模板编辑器中，选择某个字段
- 在"预设内容"输入框中输入默认值
- 保存配置后，下次选择该模板会自动填充

### 4. 我的证书
- 点击右上角"我的证书"
- 查看所有已保存的证书
- 点击证书可以重新编辑
- 点击删除按钮可以删除证书

---

## 🐛 常见问题

### 问题 1：后端启动失败

**错误：`Cannot find module 'express'`**

**解决：**
```bash
cd server
npm install
cd ..
```

---

### 问题 2：证书保存到 LocalStorage 而不是文件

**原因：** 后端服务未启动

**解决：** 确保运行了 `npm run dev:all` 或 `npm run dev:server`

**验证后端是否运行：**
```bash
# 在浏览器访问
http://localhost:3001/api/health
```

应该返回：
```json
{
  "status": "ok",
  "timestamp": "2025-10-01T..."
}
```

---

### 问题 3：端口被占用

**错误：`Port 3001 is already in use`**

**解决方式一：关闭占用端口的程序**
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <进程ID> /F

# Mac/Linux
lsof -ti:3001 | xargs kill -9
```

**解决方式二：修改后端端口**

编辑 `server/index.js`：
```javascript
const PORT = 3002; // 改为其他端口
```

同时修改 `src/utils/api.ts`：
```typescript
const API_BASE_URL = 'http://localhost:3002/api';
```

---

### 问题 4：模板列表重复

**解决：** 清除浏览器缓存或 LocalStorage

按 F12 打开开发者工具 → Application → Local Storage → 右键清除

然后刷新页面。

---

## 📖 更多文档

- **完整使用指南**：[README.md](./README.md)
- **部署指南**：[DEPLOYMENT.md](./DEPLOYMENT.md)
- **后端 API 文档**：[server/README.md](./server/README.md)

---

## 🎉 开始使用

一切就绪！现在您可以：

1. 🎨 创建精美证书
2. 📝 配置模板字段
3. 💾 保存到文件系统
4. 📦 导出配置备份
5. 🗂️ 管理我的证书

**祝您使用愉快！** 🚀

