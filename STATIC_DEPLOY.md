# 静态文件部署方案

## 🚀 解决方案：预构建静态文件

### 问题分析
- Vercel执行任何构建命令都会报错126（权限问题）
- 解决方案：本地构建后直接部署静态文件

### 部署步骤

#### 1. 本地构建
```bash
npm run build
```

#### 2. 复制构建文件到根目录
```bash
# Windows PowerShell
Copy-Item -Path "dist\*" -Destination "." -Recurse -Force

# 或者手动复制 dist/ 目录下的所有文件到根目录
```

#### 3. 提交到GitHub
```bash
git add .
git commit -m "Add built files for Vercel deployment"
git push origin main
```

#### 4. Vercel部署
- 在Vercel中导入项目
- Vercel会直接使用根目录的静态文件
- **不需要任何构建过程**

### 文件结构
```
项目根目录/
├── index.html          # 构建后的主页面
├── assets/             # 构建后的资源文件
│   ├── index-*.js      # JavaScript文件
│   └── index-*.css     # CSS文件
├── data/               # 数据文件
│   └── f1-schedule-2025.json
├── vercel.json         # Vercel配置
└── .vercelignore       # 忽略文件
```

### vercel.json配置
```json
{
  "version": 2,
  "builds": [
    {
      "src": "index.html",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### .vercelignore配置
```
src/
node_modules/
*.md
.git/
.gitignore
vite.config.js
package.json
package-lock.json
.npmrc
dist/
start-dev.bat
start-preview.bat
QUICK_START.md
DEPLOYMENT.md
VERCEL_DEPLOY.md
```

## ✅ 优势

- **避免构建错误**：Vercel不需要执行任何构建命令
- **快速部署**：直接使用预构建的静态文件
- **稳定可靠**：不依赖Vercel的构建环境
- **完全控制**：本地构建，确保文件正确

## 🔄 更新流程

当需要更新时：
1. 修改源码
2. 本地运行 `npm run build`
3. 复制构建文件到根目录
4. 提交并推送到GitHub
5. Vercel自动重新部署

## 🎯 部署后

部署成功后，您将获得一个URL，例如：
- `https://your-project-name.vercel.app`

所有路由都会重定向到 `index.html`，支持Vue Router。
