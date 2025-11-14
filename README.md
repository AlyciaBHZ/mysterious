# 小六壬快速排盘 🔮

<div align="center">

![小六壬排盘](./public/project.png)

**一个现代化的小六壬在线排盘工具 + AI智能解卦**

[![在线体验](https://img.shields.io/badge/在线体验-mysterious.lexaverse.dev-brightgreen)](https://mysterious.lexaverse.dev)
[![部分开源](https://img.shields.io/badge/License-部分开源-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)

[🚀 立即体验](https://mysterious.lexaverse.dev) · [📖 使用文档](#-使用方法) · [🤝 商业合作](#-商业合作)

</div>

---

## ⚠️ 重要说明

### 🔒 部分开源项目

本项目采用 **部分开源** 模式：

✅ **开源部分**：
- UI/UX 界面代码
- AI解卦集成方案
- 前端交互逻辑
- 用户体验优化

🔐 **私有部分**：
- 核心排盘算法（`core.logic.ts`）
- 六亲关系计算逻辑
- 五行生克专有实现

### 为什么部分开源？

1. **传统文化保护**：江氏小六壬算法经过多年实践验证，属于文化传承
2. **算法价值**：核心算法凝聚了大量研究和优化工作
3. **开放学习**：UI/UX代码完全开放，供开发者学习参考
4. **可用性**：提供免费在线版本，任何人都可以使用

---

## 📖 项目简介

**小六壬快速排盘** 是一个基于古老六壬术数的现代化在线工具。通过输入日期数字和时辰，即可快速生成六宫排盘结果。

### 核心功能

- 🏛️ **六宫布局**：大安、留连、速喜、赤口、小吉、空亡
- 🌿 **五行属性**：木、火、土、金、水、天空
- 🕐 **时辰对应**：十二时辰完整支持
- 🐉 **神煞标注**：玄武、青龙、朱雀、白虎、腾蛇、勾陈
- 👥 **六亲关系**：父母、子孙、官鬼、妻财、兄弟
- 🤖 **AI智能解卦**：集成Gemini和Claude双引擎

---

## 🚀 快速开始

### 在线使用（推荐）

访问 **https://mysterious.lexaverse.dev** 立即开始使用，无需安装！

### 本地开发（UI开发者）

如果你想学习或改进UI/UX，可以克隆本仓库：

```bash
# 克隆仓库
git clone https://github.com/your-username/mysterious.git
cd mysterious

# 安装依赖
npm install

# 复制配置文件
cp src/config.local.example.ts src/config.local.ts
cp src/core.logic.example.ts src/core.logic.ts

# 启动开发服务器
npm run dev
```

⚠️ **注意**：由于核心算法未包含，本地运行的版本仅能展示UI界面，无法进行实际排盘计算。

---

## 📚 使用方法

### 基本排盘

1. **输入日期数值** (1-30)
   - 可以是农历日期
   - 也可以是事件序号

2. **选择时辰** (子时-亥时)
   - 子时：23:00-1:00
   - 丑时：1:00-3:00
   - ...以此类推

3. **点击"开始排盘"**
   - 系统立即生成六宫结果
   - 显示自身宫位（淡蓝色背景）
   - 标注六亲关系

### AI智能解卦

排盘完成后，可以使用AI解卦功能：

1. **向下滚动**到AI解卦区域
2. **输入问题**：如"今日运势如何？"
3. **点击"✨ 开始AI解卦"**
4. **等待5-15秒**获得专业解析

AI会提供以下分析：
- 一、整体运势总论
- 二、自身宫位与主卦解读
- 三、六亲关系与人际互动
- 四、五行生克与旺衰
- 五、建议与注意事项

---

## 🛠️ 技术栈

### 前端（开源）

- **框架**：React 18.2 + TypeScript
- **构建工具**：Vite
- **样式方案**：Tailwind CSS
- **UI组件**：shadcn/ui
- **部署**：GitHub Pages

### AI集成

- **Google Gemini 2.0 Flash**
- **Anthropic Claude 3.5 Sonnet**

### 核心算法（私有）

- 江氏小六壬排盘逻辑
- 五行生克计算
- 六亲关系推算

---

## 🎨 功能特点

### UI/UX设计

- ✅ 现代化禅意设计风格
- ✅ 响应式布局（支持移动端）
- ✅ 中式美学元素（太极图、分隔线）
- ✅ 优雅的加载动画
- ✅ 清晰的视觉层次

### 排盘功能

- ✅ 精准的六壬算法
- ✅ 完整的六亲关系
- ✅ 自动生成神煞标注
- ✅ 五行属性标识
- ✅ 自身宫位高亮

### AI解卦

- ✅ 双AI引擎支持
- ✅ 结构化解析结果
- ✅ Markdown格式化显示
- ✅ 专业的卦象解读

---

## 📁 项目结构

```
mysterious/
├── src/
│   ├── components/          # UI组件（开源）
│   │   ├── PalaceCard.tsx   # 宫位卡片
│   │   ├── UserManual.tsx   # 使用手册
│   │   └── ui/              # 基础UI组件
│   ├── App.tsx              # 主应用（开源）
│   ├── types.ts             # 类型定义（开源）
│   ├── config.local.ts      # 本地配置（私有，git忽略）
│   ├── core.logic.ts        # 核心算法（私有，git忽略）
│   └── core.logic.example.ts # 算法接口示例（开源）
├── public/                  # 静态资源
├── LICENSE                  # 许可协议
└── README.md               # 项目说明
```

---

## 🤝 如何贡献

我们欢迎以下类型的贡献：

### ✅ 欢迎贡献

- UI/UX改进
- 文档完善
- Bug修复（非核心算法部分）
- 新功能建议
- 国际化/多语言支持

### ❌ 不接受的贡献

- 核心算法相关的改动
- 绕过算法保护的尝试

### 贡献流程

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交改动 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 🔐 安全说明

### 核心算法保护

- `core.logic.ts` 文件已加入 `.gitignore`
- GitHub仓库中不包含实际算法实现
- 生产环境使用编译后的版本
- 请勿尝试逆向工程

### API Key管理

- 所有API Key存储在本地（localStorage）
- 不上传到任何服务器
- `config.local.ts` 已加入 `.gitignore`
- 用户完全掌控自己的Key

---

## 💼 商业合作

如您有以下需求，欢迎联系：

### 合作方式

- 📱 **移动端App开发**
- 🌐 **私有部署方案**
- 🔌 **API接口服务**
- 🎨 **定制化界面**
- 📚 **算法授权使用**

### 联系方式

- **GitHub Issues**: 技术问题和商业咨询
- **在线体验**: https://mysterious.lexaverse.dev

---

## 📄 许可协议

本项目采用 **自定义部分开源许可** 协议。详见 [LICENSE](LICENSE) 文件。

### 简要说明

- ✅ 个人免费使用在线版本
- ✅ 学习研究开源代码
- ❌ 禁止商业使用（需授权）
- ❌ 禁止复制核心算法

---

## 🙏 致谢

- 感谢传统六壬文化的传承者
- 感谢开源社区的优秀工具
- 感谢每一位用户的支持

---

## 📮 联系我们

- **项目主页**: https://mysterious.lexaverse.dev
- **GitHub**: https://github.com/AlyciaBHZ/mysterious
- **反馈建议**: 通过 GitHub Issues

---

<div align="center">

**小六壬快速排盘** - 传统智慧与现代科技的完美结合

Made with ❤️ by 小六壬团队

[⬆ 返回顶部](#小六壬快速排盘-)

</div>

