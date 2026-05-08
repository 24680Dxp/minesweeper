# 🎮 MINESWEEPER - 复古未来主义扫雷游戏

> 一款融合80年代街机美学与现代极简主义的网页扫雷游戏

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![HTML5](https://img.shields.io/badge/HTML5-orange)
![CSS3](https://img.shields.io/badge/CSS3-1572B6)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)

## 🌟 特色功能

### 🎯 三种难度级别
- **初级**：9×9 格子，10个地雷
- **中级**：16×16 格子，40个地雷
- **高级**：30×16 格子，99个地雷

### ✨ 游戏特性
- 🎨 **复古未来主义设计**：融合80年代霓虹灯光与现代美学
- 🔮 **首次点击保护**：确保第一次点击不会是地雷
- 📊 **实时统计**：显示剩余地雷数量和游戏时间
- 🎭 **表情反馈**：游戏状态实时显示在表情按钮上
- 🌊 **空白扩展**：点击空白格子自动揭示周围区域
- 📱 **响应式设计**：完美支持桌面和移动设备

## 🎮 游戏规则

1. **左键点击**：揭示格子
2. **右键点击**：标记/取消标记地雷
3. **长按（移动端）**：标记地雷
4. **目标**：揭示所有非雷格子即可获胜！

## 🚀 快速开始

### 方法一：直接打开
直接双击 `index.html` 文件在浏览器中打开游戏。

### 方法二：本地服务器
```bash
# 使用 Python 3
python -m http.server 8000

# 使用 Node.js (npx)
npx serve .

# 使用 PHP
php -S localhost:8000
```

然后在浏览器中访问 `http://localhost:8000`

## 📂 项目结构

```
/workspace/
├── index.html          # 游戏主页面
├── css/
│   └── style.css       # 样式文件
├── js/
│   └── game.js         # 游戏逻辑
├── .trae/
│   └── documents/      # 项目文档
│       ├── minesweeper-prd.md
│       └── minesweeper-architecture.md
└── README.md           # 项目说明
```

## 🎨 设计理念

本游戏采用**复古未来主义（Retro-Futurism）**设计风格：

- **深邃夜空黑**背景配合**荧光青色**和**霓虹红色**点缀
- **像素风格字体**（Press Start 2P）营造怀旧感
- **平滑动画效果**带来现代游戏体验
- **霓虹光晕效果**增添赛博朋克氛围

## 🛠️ 技术栈

- **HTML5**：语义化标签
- **CSS3**：CSS Grid、CSS Variables、Flexbox、Animations
- **JavaScript (ES6+)**：原生实现，无框架依赖
- **Google Fonts**：Press Start 2P、JetBrains Mono

## 🎯 浏览器兼容

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 📱 响应式支持

- ✅ 桌面端（1024px+）
- ✅ 平板端（768px - 1024px）
- ✅ 移动端（< 768px）
- ✅ 触摸屏设备

## 🎮 操作指南

### 键盘快捷键
- **Tab**：导航到游戏区域
- **方向键**：移动焦点格子
- **Enter/Space**：揭示格子
- **F**：标记/取消标记地雷

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

---

**Made with 💚 by 24680Dxp**
