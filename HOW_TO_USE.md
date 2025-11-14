# 📖 如何使用本项目

## 🎯 三种使用方式

### 1. 在线使用（最简单）✨

直接访问 **https://mysterious.lexaverse.dev** 即可使用完整功能。

**适合人群**：
- 普通用户
- 想要体验AI解卦的用户
- 不需要了解技术细节的用户

---

### 2. UI学习和改进（开发者）👨‍💻

如果你想学习或改进UI/UX：

#### 步骤：

```bash
# 1. 克隆仓库
git clone https://github.com/your-username/mysterious.git
cd mysterious

# 2. 安装依赖
npm install

# 3. 复制配置文件
cp src/config.local.example.ts src/config.local.ts
cp src/core.logic.example.ts src/core.logic.ts

# 4. 启动开发服务器
npm run dev
```

#### ⚠️ 重要提示

- 示例版本的核心算法是**空实现**
- 排盘功能不会真正工作
- 仅能用于UI开发和学习

#### 可以做什么

✅ 修改界面样式
✅ 改进用户体验
✅ 优化响应式布局
✅ 添加新的UI功能
✅ 学习React+TypeScript

#### 不能做什么

❌ 运行完整的排盘功能
❌ 测试核心算法
❌ 商业用途

---

### 3. 商业使用和授权（企业）🏢

如果你需要：
- 私有部署完整版本
- 获得核心算法授权
- 定制化开发
- API接口对接
- 移动端App开发

请通过以下方式联系：
- **GitHub Issues**: 技术问题和商业咨询
- **在线体验**: https://mysterious.lexaverse.dev

---

## 🔍 项目文件说明

### 开源文件（GitHub上可见）

```
src/
├── App.tsx                      # 主应用（开源）
├── components/                  # UI组件（开源）
│   ├── PalaceCard.tsx          # 宫位卡片
│   ├── UserManual.tsx          # 使用手册
│   └── ui/                     # 基础UI组件
├── types.ts                    # 类型定义（开源）
├── config.local.example.ts     # 配置示例（开源）
└── core.logic.example.ts       # 算法接口示例（开源）
```

### 私有文件（仅本地存在）

```
src/
├── config.local.ts             # 实际配置（私有，git忽略）
└── core.logic.ts               # 核心算法（私有，git忽略）
```

---

## 🎨 UI开发者快速上手

### 目标

学习本项目的UI/UX设计，改进界面体验。

### 环境要求

- Node.js 18+
- npm 或 yarn
- 现代浏览器

### 开发流程

```bash
# 1. 安装依赖
npm install

# 2. 复制配置文件
cp src/config.local.example.ts src/config.local.ts
cp src/core.logic.example.ts src/core.logic.ts

# 3. 启动开发服务器
npm run dev

# 4. 在浏览器中打开
# http://localhost:5173

# 5. 修改UI代码
# 修改 src/App.tsx 或 src/components/ 下的文件

# 6. 查看实时效果
# Vite会自动热更新
```

### 可以学习的内容

- ✅ React Hooks使用
- ✅ TypeScript类型系统
- ✅ Tailwind CSS样式
- ✅ 响应式设计
- ✅ 组件化开发
- ✅ AI API集成方案

### 贡献代码

如果你改进了UI，欢迎提交Pull Request！

```bash
# 1. Fork本仓库
# 2. 创建特性分支
git checkout -b feature/ui-improvement

# 3. 提交改动
git commit -m "improve: 优化xxx界面"

# 4. 推送分支
git push origin feature/ui-improvement

# 5. 在GitHub上创建Pull Request
```

---

## 🤖 AI解卦功能

### 如何获取API Key

#### Gemini（推荐，免费）

1. 访问 https://aistudio.google.com/app/apikey
2. 登录Google账号
3. 点击"Create API Key"
4. 复制生成的Key

#### Claude（需付费）

1. 访问 https://console.anthropic.com/
2. 注册/登录账号
3. 进入"API Keys"页面
4. 创建新Key

### 配置API Key

在 `src/config.local.ts` 中：

```typescript
export const DEFAULT_API_KEY = 'your-api-key-here';
export const DEFAULT_AI_MODEL: 'gemini' | 'claude' = 'gemini';
```

---

## 📚 进阶学习

### 推荐资源

- **React官方文档**: https://reactjs.org/
- **TypeScript文档**: https://www.typescriptlang.org/
- **Tailwind CSS**: https://tailwindcss.com/
- **Vite文档**: https://vitejs.dev/

### 相关项目

- **shadcn/ui**: https://ui.shadcn.com/
- **Radix UI**: https://www.radix-ui.com/

---

## ❓ 常见问题

### Q1: 为什么排盘功能不工作？

**A**: GitHub上的代码不包含核心算法实现。请使用在线版本或联系获取授权。

### Q2: 可以用于商业项目吗？

**A**: 不可以。商业使用需要获得授权。请通过GitHub Issues联系。

### Q3: 如何贡献代码？

**A**: 欢迎提交UI改进！Fork本仓库，修改后提交Pull Request即可。

### Q4: API Key会被泄露吗？

**A**: 不会。API Key仅存储在浏览器本地，不会上传到任何服务器。

---

## 📞 需要帮助？

- 📖 查看 [README.md](README.md) 了解项目详情
- 🚀 查看 [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) 了解部署流程
- 💼 商业合作：通过GitHub Issues联系
- 🐛 反馈Bug：提交GitHub Issue

---

<div align="center">

**祝你使用愉快！** 🎉

[返回主页](README.md)

</div>

