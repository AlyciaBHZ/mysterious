# 小六壬排盘 (Mysterious)

一个现代化的小六壬排盘工具，使用 React + TypeScript 构建。

## 🌟 在线演示

🔗 **[立即体验](https://alyciabhz.github.io/mysterious/)**

## ✨ 功能特点

- ✅ **精准计算**: 实现完整的六壬排盘算法
- 🎨 **现代设计**: 采用 Modern Zen UI 设计风格
- 📱 **响应式布局**: 支持移动端和桌面端
- 🚀 **快速交互**: 实时计算，无需等待
- 📖 **用户手册**: 内置详细使用说明

## 🔮 核心功能

### 排盘要素

- **六宫布局**: 大安、流连、速喜、赤口、小吉、空亡
- **五行对应**: 木、火、土、金、水、天空
- **时辰系统**: 十二时辰完整支持
- **神兽标注**: 玄武、青龙、朱雀、白虎、腾蛇、勾陈

### 计算逻辑

1. 输入 X1 (1-30) 计算天盘落点
2. 选择时辰 (X2) 计算自身落点
3. 自动生成六宫排盘结果
4. 标注落点位置和对应神兽

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:3000

### 构建生产版本

```bash
npm run build
```

构建产物位于 `build/` 目录

### 预览构建结果

```bash
npm run preview
```

## 📖 使用说明

1. **输入 X1**: 在第一个输入框输入 1-30 的数字
2. **选择时辰**: 从下拉菜单选择对应时辰 (X2)
3. **开始排盘**: 点击"开始排盘"按钮
4. **查看结果**: 六宫布局显示，红色标注"自身"位置

## 🛠️ 技术栈

- **框架**: React 18 + TypeScript
- **构建工具**: Vite 6
- **样式方案**: Tailwind CSS 4
- **UI 组件**: Radix UI
- **图标**: Lucide React
- **部署**: GitHub Pages

## 📁 项目结构

```
mysterious/
├── src/
│   ├── App.tsx              # 主应用组件
│   ├── components/
│   │   ├── PalaceCard.tsx   # 宫格卡片组件
│   │   ├── UserManual.tsx   # 用户手册组件
│   │   └── ui/              # UI 基础组件
│   ├── main.tsx             # 应用入口
│   └── index.css            # 全局样式
├── public/                  # 静态资源
├── vite.config.ts          # Vite 配置
└── package.json
```

## 🎨 设计理念

本项目基于 [Modern Zen UI Design](https://www.figma.com/design/wFaMNfvRBes7SClaweO6r4/Modern-Zen-UI-Design) 设计系统，追求：

- **简洁**: 去除冗余，保留核心
- **优雅**: 柔和的配色与流畅的动画
- **易用**: 直观的交互，清晰的信息层级

## 📄 许可证

MIT License

## 👤 作者

Alycia BHZ

---

**⭐ 如果这个项目对你有帮助，欢迎 Star！**
