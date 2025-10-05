# Vercel部署说明

## 🚀 零配置部署

### 1. 删除vercel.json
- 不使用自定义配置文件
- 让Vercel自动检测项目类型

### 2. 推送代码到GitHub
```bash
git add .
git commit -m "Deploy to Vercel"
git push origin main
```

### 3. 在Vercel中部署
1. 访问 [vercel.com](https://vercel.com)
2. 点击 "New Project"
3. 导入GitHub仓库
4. **不要修改任何设置**，直接点击 "Deploy"

### 4. Vercel会自动：
- 检测到Vue项目
- 运行 `npm install`
- 运行 `npm run build`
- 部署到 `dist` 目录

## 🔧 项目配置

### package.json
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "start": "npm run dev"
  }
}
```

### vite.config.js
```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist'
  }
})
```

## ✅ 优势

- **零配置**：不需要vercel.json
- **自动检测**：Vercel自动识别Vue项目
- **简单部署**：一键部署
- **避免权限问题**：使用Vercel默认构建流程

## 🎯 部署后

部署成功后，您将获得一个URL，例如：
- `https://your-project-name.vercel.app`

## 🔄 自动部署

- 每次推送到main分支都会自动重新部署
- 支持预览部署（PR部署）
- 支持回滚到之前的版本
