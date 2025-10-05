# Vercel部署指南

## 🚀 部署到Vercel

### 方法一：通过Vercel CLI
```bash
# 安装Vercel CLI
npm i -g vercel

# 登录Vercel
vercel login

# 部署项目
vercel

# 生产部署
vercel --prod
```

### 方法二：通过GitHub集成
1. 将代码推送到GitHub仓库
2. 在Vercel控制台连接GitHub仓库
3. 自动部署

### 方法三：通过Vercel Dashboard
1. 访问 [vercel.com](https://vercel.com)
2. 点击 "New Project"
3. 导入GitHub仓库
4. 配置构建设置：
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install --legacy-peer-deps`

## 🔧 配置文件说明

### vercel.json
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "installCommand": "npm install --legacy-peer-deps",
  "devCommand": "npm run dev",
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### vite.config.js
- 使用 `esbuild` 作为压缩工具（避免terser依赖问题）
- 配置了代码分割
- 设置了正确的base路径

## 🛠️ 故障排除

### 权限问题
如果遇到权限错误，确保：
1. 使用 `--legacy-peer-deps` 安装依赖
2. 检查vercel.json配置
3. 确保构建命令正确

### 构建失败
1. 检查Node.js版本兼容性
2. 确保所有依赖都已安装
3. 检查Vite配置是否正确

### 路由问题
- 配置了SPA路由重定向
- 所有路径都会重定向到index.html

## 📋 部署检查清单

- [ ] package.json配置正确
- [ ] vercel.json配置完整
- [ ] vite.config.js优化设置
- [ ] 本地构建测试通过
- [ ] 环境变量配置（如需要）

## 🌐 部署后访问

部署成功后，您将获得一个Vercel URL，例如：
- `https://your-project-name.vercel.app`

## 🔄 自动部署

配置GitHub集成后：
- 每次推送到main分支都会自动部署
- 可以配置预览部署（PR部署）
- 支持回滚到之前的版本
