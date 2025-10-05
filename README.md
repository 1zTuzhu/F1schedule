# F1赛历 Vue版本

这是一个使用Vue 3开发的F1赛历应用，显示2025年一级方程式世界锦标赛的完整时间表。

## 功能特性

- 📅 完整的2025年F1赛历
- 🏁 实时比赛状态更新
- 📱 响应式设计，支持移动端
- 🎨 现代化暗色调UI设计
- 🔍 智能筛选功能
- 📺 直播观看链接
- ⏰ 北京时间显示

## 技术栈

- Vue 3 (Composition API)
- Vite (构建工具)
- CSS3 (现代化样式)
- JavaScript ES6+

## 安装和运行

### 方法一：使用命令行
```bash
# 安装依赖
npm install

# 开发模式（推荐）
npm run dev
# 或者
npm start

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
# 或者
npm run serve
```

### 方法二：使用批处理文件（Windows）
```bash
# 开发模式
start-dev.bat

# 预览模式
start-preview.bat
```

### 方法三：使用VSCode调试
1. 按 `F5` 或点击"Run and Debug"
2. 选择"Launch Vue App"配置
3. 或者使用"Run without debug"运行

### 访问应用
- **开发模式**: http://localhost:3000
- **预览模式**: http://localhost:4173

## 项目结构

```
src/
├── App.vue              # 主组件
├── main.js             # 应用入口
├── assets/
│   └── css/
│       └── styles.css   # 样式文件
└── data/
    └── f1-schedule-2025.json  # 赛程数据
```

## 功能说明

### 筛选功能
- **全部比赛**: 显示所有比赛
- **即将开始**: 显示下一场比赛
- **已经结束**: 显示已完成的比赛
- **观看直播**: 显示直播观看链接

### 比赛信息
- 比赛名称和地点
- 比赛状态（已完赛/即将开始）
- 详细的时间表（练习赛、排位赛、正赛）
- 冲刺赛周末支持

### 响应式设计
- 桌面端：完整布局
- 移动端：优化的单列布局
- 平板端：自适应网格布局

## 数据格式

赛程数据采用JSON格式，包含以下信息：
- 比赛轮次
- 比赛名称和地点
- 各阶段时间（练习赛、排位赛、正赛）
- 冲刺赛标识

## 浏览器支持

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## 开发说明

### 添加新功能
1. 在 `App.vue` 中添加新的响应式数据
2. 在 `setup()` 函数中实现逻辑
3. 在模板中使用新的数据和方法

### 样式修改
- 所有样式都在 `src/assets/css/styles.css` 中
- 使用CSS变量进行主题管理
- 支持暗色调主题

### 数据更新
- 修改 `src/data/f1-schedule-2025.json` 文件
- 数据格式需要保持一致性

## 许可证

© 2025 1zTuzhu. All rights reserved.
