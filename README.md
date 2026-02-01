# 小六壬快速排盘

<div align="center">

![小六壬排盘](./public/project.png)

**一个现代化的小六壬在线排盘工具 + AI智能解卦**

[![在线体验](https://img.shields.io/badge/在线体验-mysterious.lexaverse.dev-brightgreen)](https://mysterious.lexaverse.dev)
[![部分开源](https://img.shields.io/badge/License-部分开源-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)

[🚀 立即体验](https://mysterious.lexaverse.dev) · [🧩 半开源说明](#-半开源说明) · [🛠️ 开发](#️-本地开发) · [🚀 部署](DEPLOY.md)

</div>

---

## 🧩 半开源说明

本仓库采用**半开源**模式：

- **公开（可贡献）**：前端 UI/交互、工程化、非核心逻辑
- **不公开（私有/授权）**：核心排盘算法与部分提示词/规则实现（例如 `src/core.logic.ts` 等）

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

## 🛠️ 本地开发

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

说明：

- 公共仓库默认不包含核心算法实现；本地开发主要用于 UI/交互改进
- 线上站点为完整版本（包含私有实现与运行配置）

---

## 📚 使用方法（面向用户）

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

### AI 集成

- `mysterious-api/` 提供 Vercel 后端代理（保护 Key、做额度/用户/支付/历史等服务端能力）

### 核心算法（私有）

- 江氏小六壬排盘逻辑
- 五行生克计算
- 六亲关系推算

---

## ✨ 功能

- 六宫排盘展示（UI）
- AI 解卦（后端代理）
- 用户登录、历史记录、支付与额度（后端）

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

## 🔐 安全与边界

- 私有实现文件保持在 `.gitignore`
- 不在公共文档中写入真实密钥/供应商后台细节

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

- **GitHub Issues**：技术问题和商业咨询
- **在线体验**：https://mysterious.lexaverse.dev

---

## 📄 许可协议

本项目采用 **自定义部分开源许可** 协议。详见 [LICENSE](LICENSE) 文件。

### 简要说明

- ✅ 个人免费使用在线版本
- ✅ 学习研究开源代码
- ❌ 禁止商业使用（需授权）
- ❌ 禁止复制核心算法

---

## 📄 其它

- 署名与引用：见 `ATTRIBUTIONS.md`

