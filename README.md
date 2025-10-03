# 🎓 CertMaster - 证书制作系统

<div align="center">

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![Python](https://img.shields.io/badge/python-3.8+-green.svg)
![Node](https://img.shields.io/badge/node-16+-brightgreen.svg)
![License](https://img.shields.io/badge/license-MIT-orange.svg)

**一个功能强大、易于使用的证书制作系统**

[快速开始](#快速开始) • [功能特点](#功能特点) • [部署指南](#部署指南) • [使用说明](#使用说明)

</div>

---

## 📖 目录

- [项目简介](#项目简介)
- [功能特点](#功能特点)
- [技术栈](#技术栈)
- [快速开始](#快速开始)
- [部署指南](#部署指南)
- [使用说明](#使用说明)
- [模板配置](#模板配置)
- [项目结构](#项目结构)
- [常见问题](#常见问题)
- [更新日志](#更新日志)

---

## 📝 项目简介

CertMaster 是一个基于 Web 的证书制作系统，支持：
- ✨ 可视化证书编辑
- 🎨 自定义模板配置
- 💾 证书数据管理
- 📥 批量导入导出
- 🖼️ 多种模板支持（证书、盖章、水印）

适用于学校、培训机构、企业等需要批量制作证书的场景。

---

## ✨ 功能特点

### 核心功能
- 📄 **证书模板管理** - 支持证书、盖章、水印三类模板
- ✏️ **可视化编辑器** - 拖拽式字段配置，所见即所得
- 💾 **数据持久化** - 支持后端存储和浏览器本地存储
- 🔄 **预设内容** - 模板可配置默认填充内容
- 📅 **中文日期** - 自动转换为中文大写日期格式
- 🔢 **证书编号** - 自动生成或手动输入

### 高级功能
- 🎯 **字段自定义** - 自由调整位置、字体、大小、颜色、对齐方式
- 📏 **文本换行** - 支持最大宽度、行高、自动换行
- 🔄 **盖章旋转** - 支持自定义盖章位置和旋转角度
- 💧 **水印支持** - 可添加背景水印
- 📦 **配置导入导出** - 一键备份和迁移配置
- 🗂️ **证书列表** - 查看、编辑、删除已保存的证书

---

## 🛠️ 技术栈

### 前端
- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **样式**: Tailwind CSS
- **图标**: Lucide React
- **状态管理**: React Hooks

### 后端
- **框架**: FastAPI (Python)
- **服务器**: Uvicorn
- **API 文档**: Swagger UI

### 数据存储
- **主存储**: JSON 文件 (后端)
- **备份存储**: LocalStorage (前端)
- **图片存储**: PNG 文件

---

## 🚀 快速开始

### 环境要求
- **Python**: 3.8 或更高版本
- **Node.js**: 16 或更高版本
- **操作系统**: Windows 10/11（推荐）
- **浏览器**: Chrome / Edge / Firefox（最新版本）

### 一键启动

1. **克隆或下载项目**
   ```bash
   git clone <repository-url>
   cd CertMaster
   ```

2. **运行启动脚本**
   ```bash
   # Windows
   双击运行 启动.bat
   
   # 或使用命令行
   .\启动.bat
   ```

3. **访问系统**
   - 🌐 前端页面: http://localhost:5173
   - 🔧 后端 API: http://localhost:8000
   - 📚 API 文档: http://localhost:8000/api/docs

启动脚本会自动：
- ✅ 检查 Python 和 Node.js 环境
- ✅ 安装所需依赖
- ✅ 启动后端服务（端口 8000）
- ✅ 启动前端服务（端口 5173）

---

## 📦 部署指南

### 方法一：完整部署（推荐）

#### 1. 准备环境

**安装 Python 3.8+**
- 下载：https://www.python.org/downloads/
- ⚠️ **重要**：安装时勾选 "Add Python to PATH"

**安装 Node.js 16+**
- 下载：https://nodejs.org/

#### 2. 复制项目文件

将整个项目文件夹复制到目标位置，例如：
```
D:\CertMaster\
```

#### 3. 安装依赖

**自动安装（推荐）**
```bash
双击运行 启动.bat
```

**手动安装**
```bash
# 后端依赖
cd backend
pip install -r requirements.txt

# 前端依赖
cd frontend
npm install
```

#### 4. 启动服务

```bash
# 使用启动脚本
.\启动.bat

# 或手动启动
# 后端
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 前端
cd frontend
npm run dev
```


## 📖 使用说明

### 1. 证书制作流程

#### 步骤 1：选择证书模板
1. 在右侧预览区域选择 **证书模板**
2. 选择 **盖章模板**（必选）
3. 选择 **水印模板**（可选）

#### 步骤 2：填写证书信息
在左侧编辑区填写：
- **姓名** - 支持"亲爱的XXX："等格式，保存时自动清理
- **证书内容** - 多行文本，支持换行
- **指导单位** - 显示时自动添加"指导单位："前缀
- **证书编号** - 可手动输入或点击"生成"按钮
- **授权时间** - 选择日期，可选是否显示"日"
- **授权单位** - 显示时自动添加"授权单位："前缀

#### 步骤 3：预览和调整
- 右侧实时预览证书效果
- 检查字段位置、内容是否正确
- 如需调整模板，点击设置图标进入模板管理

#### 步骤 4：保存或下载
- **保存证书** - 保存到系统（包含图片和数据）
- **下载证书** - 直接下载 PNG 图片

### 2. 模板管理

#### 访问模板管理器
点击右上角 **设置图标** → **模板管理**

#### 上传新模板
1. 选择模板类型（证书/盖章/水印）
2. 点击 **上传模板**
3. 选择图片文件（PNG/JPG）

#### 编辑模板配置
1. 找到要编辑的证书模板
2. 点击 **编辑** 按钮
3. 在可视化编辑器中调整：
   - 🎯 拖拽字段调整位置
   - 🔤 修改字体大小、颜色
   - 📐 设置对齐方式
   - 📏 配置最大宽度、行高
   - 🔄 调整盖章位置和旋转角度
4. 设置预设内容（可选）
5. 点击 **保存** 按钮

#### 导入/导出配置
- **导出配置** - 备份所有模板配置为 JSON 文件
- **导入配置** - 从 JSON 文件恢复配置

### 3. 证书列表

#### 查看已保存证书
点击左上角 **证书图标** 查看列表

#### 操作证书
- **选择** - 点击证书卡片加载到编辑器
- **删除** - 点击删除按钮移除证书

---

## ⚙️ 模板配置

### 配置文件格式

证书模板配置保存在 `data/configs/template_config_{id}.json`

```json
{
  "name": {
    "x": 263,              // X 坐标
    "y": 625,              // Y 坐标  
    "fontSize": 44,        // 字体大小
    "fontFamily": "SimSun, serif",
    "fontWeight": "normal", // normal | bold
    "color": "#000000",    // 颜色
    "align": "left"        // left | center | right
  },
  "content": {
    "x": 262,
    "y": 770,
    "fontSize": 44,
    "fontFamily": "SimSun, serif",
    "fontWeight": "normal",
    "color": "#000000",
    "align": "left",
    "lineHeight": 80,      // 行高（可选）
    "maxWidth": 1550,      // 最大宽度（可选）
    "maxHeight": 250       // 最大高度（可选）
  },
  "stamp": {
    "x": 1477,             // 中心点 X
    "y": 1032,             // 中心点 Y
    "width": 250,          // 宽度
    "height": 250,         // 高度
    "rotation": 5.4        // 旋转角度（度）
  },
  "defaultContent": {
    "name": "XXX同学：",
    "content": "你在中学生科普活动中...",
    "guidanceUnit": "南通市...中学",
    "authUnit": "南通星云...中心"
  }
}
```

### 配置说明

#### 字段配置
- **x, y** - 文本起始坐标（左上角为原点）
- **fontSize** - 字体大小（像素）
- **fontFamily** - 字体族，默认 "SimSun, serif"
- **fontWeight** - 字体粗细：normal 或 bold
- **color** - 文本颜色（十六进制）
- **align** - 对齐方式：left | center | right

#### 高级配置
- **lineHeight** - 行间距（像素），默认为 fontSize * 1.5
- **maxWidth** - 最大宽度，超出自动换行
- **maxHeight** - 最大高度，超出会警告
- **wrapLabel** - 是否将标签和内容分两行显示

#### 盖章配置
- **x, y** - 盖章中心点坐标
- **width, height** - 盖章尺寸
- **rotation** - 旋转角度（度），正值顺时针

#### 预设内容
- 选择该模板时自动填充的默认值
- 支持所有可编辑字段
- 留空表示不预设

---

## 📂 项目结构

```
CertMaster/
├── backend/                    # 后端服务
│   ├── app/
│   │   ├── __init__.py
│   │   └── main.py            # FastAPI 主程序
│   ├── requirements.txt       # Python 依赖
│   └── README.md
│
├── frontend/                   # 前端应用
│   ├── public/                # 静态资源
│   │   └── templates/         # 内置模板
│   │       ├── certificate-tpls/  # 证书模板
│   │       ├── stamp-tpls/        # 盖章模板
│   │       └── watermark-tpls/    # 水印模板
│   ├── src/
│   │   ├── components/        # React 组件
│   │   │   ├── CertificateEditor.tsx    # 证书编辑器
│   │   │   ├── CertificatePreview.tsx   # 证书预览
│   │   │   ├── CertificateList.tsx      # 证书列表
│   │   │   ├── TemplateManager.tsx      # 模板管理器
│   │   │   └── TemplateEditor.tsx       # 模板编辑器
│   │   ├── utils/             # 工具函数
│   │   │   ├── api.ts         # API 调用
│   │   │   ├── storage.ts     # 本地存储
│   │   │   ├── dateUtils.ts   # 日期转换
│   │   │   └── imageUtils.ts  # 图片处理
│   │   ├── App.tsx            # 主应用
│   │   ├── types.ts           # TypeScript 类型定义
│   │   └── main.tsx           # 入口文件
│   ├── package.json           # 前端依赖
│   └── vite.config.ts         # Vite 配置
│
├── data/                       # 数据目录
│   ├── certificates/          # 证书图片存储
│   ├── configs/               # 模板配置
│   ├── templates/             # 用户上传的模板
│   ├── certificates.json      # 证书数据
│   └── templates.json         # 模板数据
│
├── scripts/                    # 辅助脚本
│   ├── cleanup.py             # 清理脚本
│   └── start.py               # Python 启动脚本
│
├── 启动.bat                   # Windows 启动脚本
└── README.md                  # 项目文档
```

---

## ❓ 常见问题

### 安装问题

**Q: 提示"未找到 Python"？**  
A: 
1. 确保已安装 Python 3.8+
2. 重新安装时勾选 "Add Python to PATH"
3. 重启命令提示符或电脑

**Q: 提示"未找到 Node.js"？**  
A:
1. 确保已安装 Node.js 16+
2. 重启命令提示符
3. 检查环境变量中是否有 Node.js 路径

**Q: npm install 失败？**  
A:
```bash
# 使用淘宝镜像
npm install --registry=https://registry.npmmirror.com

# 或使用 cnpm
npm install -g cnpm --registry=https://registry.npmmirror.com
cnpm install
```

### 运行问题

**Q: 端口被占用？**  
A:
```bash
# 查找占用端口的进程
netstat -ano | findstr "8000"
netstat -ano | findstr "5173"

# 结束进程或修改端口
```

**Q: 页面显示空白？**  
A:
1. 按 F12 打开开发者工具查看错误
2. 检查后端服务是否正常运行
3. 清除浏览器缓存（Ctrl + F5）
4. 检查防火墙设置

**Q: 中文显示乱码？**  
A:
- 启动脚本已设置 UTF-8 编码（`chcp 65001`）
- 确保文件使用 UTF-8 编码保存
- 检查数据库/JSON 文件编码

### 使用问题

**Q: 如何修改默认端口？**  
A:
```python
# backend/app/main.py (第 372 行)
uvicorn.run(app, host="0.0.0.0", port=8000)  # 修改端口

# frontend/vite.config.ts
export default defineConfig({
  server: {
    port: 5173,  // 修改端口
  }
})
```

**Q: 证书保存在哪里？**  
A:
- 数据文件：`data/certificates.json`
- 图片文件：`data/certificates/`
- 浏览器备份：LocalStorage

**Q: 如何备份数据？**  
A:
- **方法一**：复制整个 `data/` 文件夹
- **方法二**：使用系统的导出配置功能
- **方法三**：直接备份 JSON 文件

**Q: 重启后配置丢失？**  
A:
- 检查后端服务是否正常启动
- 确认配置文件存在于 `data/configs/`
- 查看浏览器控制台的加载日志

---

## 🔄 更新日志

### v2.0.0 (2025-10-03)
- ✨ 新增可视化模板编辑器
- ✨ 支持字段拖拽配置
- ✨ 添加预设内容功能
- ✨ 支持中文日期转换（含"日"选项）
- ✨ 优化文件名生成（自动清理前后缀）
- ✨ 改进数据加载逻辑（后端优先）
- 🐛 修复模板配置保存问题
- 🐛 修复重启后数据加载问题
- 📝 完善部署文档

### v1.0.0 (2024-09-30)
- 🎉 项目初始版本
- ✨ 基础证书制作功能
- ✨ 模板管理功能
- ✨ 证书列表功能

---

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 📞 支持

如有问题，请：
1. 查看本文档的[常见问题](#常见问题)部分
2. 查看后端 API 文档：http://localhost:8000/api/docs
3. 提交 Issue

---

<div align="center">

**Made with ❤️ by CertMaster Team**

[⬆ 回到顶部](#-certmaster---证书制作系统)

</div>

