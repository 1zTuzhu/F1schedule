# F1赛历 Vue项目 - 快速启动指南

##  快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 启动开发服务器
```bash
npm run dev
```

### 3. 打开浏览器
访问: http://localhost:3000

## 开发工具配置

### VSCode 调试配置
项目已配置好VSCode调试设置：

1. **按 F5** - 启动调试模式
2. **Ctrl+F5** - 运行而不调试
3. **Ctrl+Shift+P** - 打开命令面板，输入"Tasks: Run Task"

### 可用的调试配置：
- **Launch Vue App** - 启动开发服务器（调试模式）
- **Run without debug** - 启动开发服务器（无调试模式）

### 可用的任务：
- **npm: dev** - 开发模式
- **npm: build** - 构建项目
- **npm: preview** - 预览构建结果
- **npm: install** - 安装依赖

## 项目结构

```
F1schedule/
├── .vscode/                 # VSCode配置
│   ├── launch.json         # 调试配置
│   ├── tasks.json          # 任务配置
│   └── settings.json       # 编辑器设置
├── src/                    # 源代码
│   ├── App.vue            # 主组件
│   ├── main.js            # 应用入口
│   ├── assets/css/        # 样式文件
│   └── data/              # 数据文件
├── dist/                   # 构建输出
├── start-dev.bat          # Windows开发启动脚本
├── start-preview.bat       # Windows预览启动脚本
└── package.json           # 项目配置
```

## 命令

```bash
# 开发
npm run dev          # 启动开发服务器
npm start            # 同上

# 构建
npm run build        # 构建生产版本
npm run preview      # 预览构建结果
npm run serve        # 同上

# 调试
F5                   # VSCode调试模式
Ctrl+F5              # VSCode运行模式
```

## 🔧 故障排除

### 端口被占用
如果3000端口被占用，Vite会自动使用下一个可用端口。

### 依赖安装失败
```bash
# 清除缓存重新安装
npm cache clean --force
npm install
```

### 构建失败
```bash
# 检查Node.js版本
node --version

# 确保使用最新版本
npm update
```
