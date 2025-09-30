# <img src="public/gold_certificate.png" width="32" height="32" alt="" style="vertical-align: middle;"> 证书制作器 (CertMaster)

一个基于 Web 的专业证书制作系统，支持自定义模板、字段配置、实时预览和批量生成。

## ✨ 功能特点

### 📋 核心功能
- **可视化证书编辑** - 直观的左右分栏布局，左侧编辑，右侧实时预览
- **模板管理系统** - 支持证书模板、盖章模板、水印模板的上传和管理
- **拖拽式配置** - 鼠标拖动调整字段位置，所见即所得
- **配置持久化** - 模板配置自动保存，下次编辑自动加载
- **证书存储** - 保存证书记录，随时查看和下载

### 🎨 模板编辑器
- **精确定位** - 支持 X/Y 坐标精确设置
- **字体配置** - 16种字体可选，支持加粗样式
- **文本对齐** - 左对齐、居中、右对齐
- **颜色自定义** - 完整的颜色选择器
- **范围限制** - 设置文本最大宽度和高度，自动换行
- **盖章配置** - 自定义盖章位置、大小和旋转角度（-10°~+10°）

### 📝 证书字段
- 姓名
- 证书内容
- 指导单位
- 证书编号（支持一键生成：CERT-YYYYMMDD-XXXX）
- 授权时间（自动转换为中文大写日期）
- 授权单位

## 🛠️ 技术栈

- **前端框架**: React 18
- **构建工具**: Vite
- **语言**: TypeScript
- **样式**: TailwindCSS
- **图标**: Lucide React
- **Canvas**: HTML5 Canvas API
- **存储**: LocalStorage

## 📦 安装步骤

### 前置要求
- Node.js 16.0 或更高版本
- npm 或 yarn 包管理器

### 1. 克隆项目
```bash
git clone <repository-url>
cd CertMaster
```

### 2. 安装依赖
```bash
npm install
# 或
yarn install
```

### 3. 启动开发服务器
```bash
npm run dev
# 或
yarn dev
```

### 4. 访问应用
打开浏览器访问: `http://localhost:3000`

### 5. 构建生产版本
```bash
npm run build
# 或
yarn build
```

生成的文件在 `dist` 目录中。

## 📖 使用说明

### 快速开始

#### 1️⃣ 准备模板图片
将证书模板、盖章、水印图片放入对应文件夹：
- `public/templates/certificate-tpls/` - 证书模板
- `public/templates/stamp-tpls/` - 盖章模板
- `public/templates/watermark-tpls/` - 水印模板

#### 2️⃣ 配置证书模板
1. 点击右上角"**模板管理**"按钮
2. 点击证书模板图片进入编辑器
3. 配置各字段的位置、字体、颜色等
4. 点击"**保存配置**"

#### 3️⃣ 制作证书
1. 在右侧上方选择"**证书模板**"和"**盖章模板**"
2. 在左侧编辑器输入证书信息
3. 右侧实时预览效果
4. 点击"**保存证书**"保存记录
5. 点击"**下载证书**"导出PNG图片

### 详细功能

#### 📄 模板管理
- **上传模板**: 点击"上传XXX模板"按钮，选择图片文件
- **预览模板**: 点击模板卡片右上角眼睛图标
- **编辑配置**: 点击证书模板的齿轮图标（仅证书模板可编辑）
- **删除模板**: 点击模板卡片的删除图标（内置模板不可删除）
- **配置状态**: 已配置的模板显示绿色"(已配置)"标签

#### ⚙️ 模板编辑器
**左侧配置面板**：
- 字段选择下拉框
- X/Y 坐标输入
- 字体大小设置
- 字体选择（16种）+ 加粗选项
- 颜色选择器
- 对齐方式（左/中/右）
- 文本范围限制（可选）

**右侧预览面板**：
- 实时预览证书模板
- 红色标记当前编辑字段
- 灰色虚线标记其他字段
- 可拖动红点快速定位
- 绿色虚线框显示文本范围

**盖章配置**：
- 位置（X/Y 中心点）
- 尺寸（宽度/高度）
- 旋转角度 + 随机按钮

#### 🎨 证书编辑器
- 所有字段带红色星号标识必填项
- 证书编号一键生成按钮
- 授权时间自动转换为中文大写
- 实时预览同步

#### 💾 证书列表
- 查看已保存的证书
- 点击证书可重新编辑
- 删除不需要的证书

## 🗂️ 项目结构

```
CertMaster/
├── public/                      # 静态资源
│   ├── templates/               # 模板文件夹
│   │   ├── certificate-tpls/    # 证书模板
│   │   ├── stamp-tpls/          # 盖章模板
│   │   └── watermark-tpls/      # 水印模板
│   ├── gold_certificate.png     # 系统Logo
│   └── logo.ico                 # 网站图标
├── src/
│   ├── components/              # React组件
│   │   ├── CertificateEditor.tsx   # 证书编辑器
│   │   ├── CertificatePreview.tsx  # 证书预览
│   │   ├── TemplateManager.tsx     # 模板管理
│   │   ├── TemplateEditor.tsx      # 模板编辑器
│   │   └── CertificateList.tsx     # 证书列表
│   ├── utils/                   # 工具函数
│   │   ├── storage.ts           # LocalStorage封装
│   │   ├── imageUtils.ts        # 图片处理
│   │   ├── dateUtils.ts         # 日期转换
│   │   └── templateScanner.ts   # 模板扫描
│   ├── types.ts                 # TypeScript类型定义
│   ├── App.tsx                  # 主应用
│   └── main.tsx                 # 入口文件
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## 🎯 核心功能实现

### 模板配置存储
- **内置模板**: 配置保存在 `LocalStorage`，键名格式 `template_config_cert_0`
- **用户模板**: 配置直接保存在模板对象的 `config` 属性
- **自动加载**: 编辑时自动从 LocalStorage 读取配置

### Canvas 渲染
1. 加载证书模板图片
2. 绘制水印（可选，透明度30%）
3. 根据配置绘制文字字段
4. 应用字体粗细、颜色、对齐方式
5. 绘制盖章（应用旋转角度）
6. 导出为 PNG 图片

### 实时预览
- 监听数据变化（`useEffect`）
- 自动触发 Canvas 重新渲染
- 支持模板、内容、配置的实时更新

## 🔧 开发指南

### 添加新字段
1. 在 `src/types.ts` 的 `TemplateConfig` 中添加字段配置
2. 在 `TemplateEditor.tsx` 的 `FIELD_LABELS` 添加标签
3. 在 `TemplateEditor.tsx` 的初始配置中设置默认值
4. 在 `CertificatePreview.tsx` 的渲染逻辑中添加绘制代码

### 添加新字体
在 `TemplateEditor.tsx` 的字体下拉框中添加新的 `<option>`：
```tsx
<option value="YourFont, fallback">字体名称</option>
```

### 调试技巧
- 打开浏览器控制台（F12）查看详细日志
- 日志带有 emoji 图标，便于识别
- 关键日志：模板加载、Canvas 渲染、配置保存

## 📝 配置说明

### 字段定位说明
- **X 坐标**: 
  - 左对齐：文本左侧起点
  - 居中：文本水平中心
  - 右对齐：文本右侧终点
- **Y 坐标**: 文本基线位置（不是顶部）

### 盖章旋转
- 推荐角度：-10° ~ +10°
- 使用"随机"按钮自动生成自然角度
- 正值顺时针，负值逆时针

### 文本范围限制
- 设置 `maxWidth` 后自动按字符换行
- 设置 `maxHeight` 后超出会在控制台警告
- 适合长文本内容字段

## 🚀 部署

### 部署到静态服务器
```bash
npm run build
```
将 `dist` 目录部署到任何静态服务器（Nginx、Apache、CDN等）

### 部署到 GitHub Pages
```bash
npm run build
# 将 dist 目录推送到 gh-pages 分支
```

### 环境变量
项目使用相对路径，无需配置环境变量

## 🐛 常见问题

### Q: 模板不显示？
**A**: 
1. 检查图片路径是否正确
2. 按 Ctrl+Shift+R 硬刷新浏览器
3. 查看控制台错误信息

### Q: 配置没有保存？
**A**: 
1. 确保点击了"保存配置"按钮
2. 检查浏览器 LocalStorage 是否启用
3. 查看控制台是否有保存成功日志

### Q: 中文字体不显示？
**A**: 
1. 确保系统已安装对应字体
2. 使用 fallback 字体（如 `serif`, `sans-serif`）
3. 检查字体名称拼写

### Q: 下载的证书不清晰？
**A**: 
1. 使用高分辨率的模板图片（推荐 1920x1357 以上）
2. Canvas 会按照模板原始尺寸导出

## 📄 许可证

MIT License

## 👥 贡献

欢迎提交 Issue 和 Pull Request！

## 📮 联系方式

如有问题或建议，请通过 Issue 联系。

---

**Enjoy creating beautiful certificates! 🎉**
