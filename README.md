# 🎓 证书制作器 (CertMaster)

一个基于 Web 的专业证书制作系统，支持自定义模板、字段配置、实时预览和批量生成。

<img src="public/gold_certificate.png" width="400" alt="CertMaster Logo">

## ✨ 核心功能

- **可视化编辑** - 左侧编辑区，右侧实时预览
- **模板管理** - 支持证书、盖章、水印模板的上传和管理
- **拖拽配置** - 鼠标拖动调整字段位置，所见即所得
- **智能生成** - 证书编号一键生成，授权时间自动转中文大写
- **数据持久** - 证书和配置自动保存到本地

## 🛠️ 技术栈

- React 18 + TypeScript + Vite
- TailwindCSS + Lucide Icons
- HTML5 Canvas API
- LocalStorage

## 📦 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 启动开发服务器
```bash
npm run dev
```

### 3. 访问应用
打开浏览器访问: `http://localhost:3000`

### 4. 构建生产版本
```bash
npm run build
```

## 📖 使用指南

### 第一步：准备模板
将模板图片放入对应文件夹：
- `public/templates/certificate-tpls/` - 证书模板
- `public/templates/stamp-tpls/` - 盖章模板
- `public/templates/watermark-tpls/` - 水印模板（可选）

### 第二步：配置模板
1. 点击右上角 **"模板管理"**
2. 点击证书模板图片进入编辑器
3. 配置各字段的位置、字体、颜色等
4. 点击 **"保存配置"**

### 第三步：制作证书
1. 右侧选择证书模板和盖章模板
2. 左侧输入证书信息（带 * 为必填项）
3. 右侧实时预览效果
4. 点击 **"保存证书"** 或 **"下载证书"**

## 🎨 模板编辑器说明

### 文字字段配置
- **X/Y 坐标**：精确定位（Y 为文本基线位置）
- **字体设置**：16 种字体 + 大小 + 加粗
- **颜色对齐**：颜色选择器 + 左/中/右对齐
- **文本范围**：设置最大宽度/高度（自动换行）
- **拖拽定位**：直接拖动红点调整位置

### 盖章配置
- **位置尺寸**：X/Y 中心点 + 宽度/高度
- **旋转角度**：-10° ~ +10°（或点击随机）

## 🗂️ 项目结构

```
CertMaster/
├── public/templates/        # 模板图片
├── src/
│   ├── components/          # React 组件
│   ├── utils/              # 工具函数
│   ├── types.ts            # 类型定义
│   └── App.tsx             # 主应用
└── package.json
```

## 🐛 常见问题

**Q: 模板不显示？**  
A: 检查图片路径，按 Ctrl+Shift+R 强制刷新

**Q: 配置没保存？**  
A: 确认点击"保存配置"，查看控制台日志（F12）

**Q: 证书不清晰？**  
A: 使用高分辨率模板图片（推荐 1920×1357 以上）

**Q: 中文字体显示异常？**  
A: 确保系统已安装对应字体

## 📝 证书字段

- 姓名 *
- 证书内容 *
- 指导单位 *
- 证书编号 *（格式：CERT-YYYYMMDD-XXXX）
- 授权时间 *（自动转中文大写）
- 授权单位 *

## 📄 许可证

MIT License

---

**Enjoy creating beautiful certificates! 🎉**
