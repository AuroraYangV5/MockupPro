# MockupPro AI - 高质量产品样机生成器

MockupPro AI 是一个基于 React 和 Gemini AI 的全栈应用，旨在帮助用户快速将自己的 Logo 视觉化到各种高质量的产品样机上。

## 核心功能

- **Logo 上传与编辑**：支持拖拽上传 Logo，并提供裁剪功能，确保 Logo 在样机上完美呈现。
- **实时预览**：在 HTML5 Canvas 上实时渲染样机和 Logo，支持缩放、旋转和位置调整。
- **AI 样机生成**：集成 Gemini 3.1 Flash Image 模型，用户可以通过文字描述生成自定义的样机背景。
- **自定义预设**：支持用户上传本地图片作为样机背景，并自动保存到浏览器本地缓存（Local Storage）。
- **多语言支持**：内置中英文双语切换。
- **响应式设计**：适配各种屏幕尺寸，提供流畅的用户体验。

## 技术栈

- **前端**：React 19, Vite, Tailwind CSS, Lucide React, Framer Motion (motion/react)
- **AI**：Google Gemini API (@google/genai)
- **工具**：React Dropzone, React Image Crop

## 快速开始

1. **安装依赖**：
   ```bash
   npm install
   ```

2. **启动开发服务器**：
   ```bash
   npm run dev
   ```

3. **配置 API 密钥**：
   在应用中点击“选择 API 密钥”以启用 AI 生成功能。

## 备案信息

京ICP备2026014244号-1

## 许可证

&copy; 2026 MockupPro AI. 保留所有权利。
