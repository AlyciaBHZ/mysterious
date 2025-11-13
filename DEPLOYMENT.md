# 小六壬排盘 - GitHub Pages 部署指南

## 📦 项目信息

- **项目名称**: 小六壬排盘 (Mysterious)
- **技术栈**: React + TypeScript + Vite + Tailwind CSS
- **部署平台**: GitHub Pages
- **仓库地址**: https://github.com/AlyciaBHZ/mysterious
- **线上地址**: https://alyciabhz.github.io/mysterious/

## 🚀 自动部署

项目已配置 GitHub Actions 自动部署工作流，每次推送到 `main` 分支时会自动构建并部署。

### 部署流程

1. **推送代码**
```bash
git add .
git commit -m "你的提交信息"
git push origin main
```

2. **自动构建**
   - GitHub Actions 会自动触发
   - 安装依赖 → 构建项目 → 部署到 GitHub Pages

3. **查看进度**
   - 访问 https://github.com/AlyciaBHZ/mysterious/actions
   - 查看部署状态

## ⚙️ 手动部署

如需手动部署：

```bash
# 安装依赖
npm install

# 构建项目
npm run build

# 构建产物位于 build/ 目录
```

## 🔧 配置说明

### 1. Vite 配置 (`vite.config.ts`)

```typescript
export default defineConfig({
  base: '/mysterious/',  // GitHub Pages 子路径
  // ...
  build: {
    outDir: 'build',     // 输出目录
  },
});
```

### 2. GitHub Actions 工作流 (`.github/workflows/deploy.yml`)

- **触发条件**: 推送到 main 分支或手动触发
- **权限**: contents: read, pages: write, id-token: write
- **构建环境**: Node.js 20
- **部署方式**: actions/deploy-pages@v4

### 3. 静态资源

- `.nojekyll` 文件已放置在 `public/` 目录，防止 Jekyll 处理

## 📋 初次部署检查清单

- [x] 配置 `vite.config.ts` 的 `base` 路径
- [x] 创建 GitHub Actions 工作流文件
- [x] 添加 `.nojekyll` 文件
- [x] 更新 `package.json` 脚本
- [ ] 在 GitHub 仓库设置中启用 GitHub Pages
- [ ] 推送代码触发部署

## 🔑 启用 GitHub Pages

1. 访问仓库设置: https://github.com/AlyciaBHZ/mysterious/settings/pages
2. **Source** 选择: `GitHub Actions`
3. 等待部署完成
4. 访问: https://alyciabhz.github.io/mysterious/

## 🐛 常见问题

### 问题 1: 页面 404

**原因**: `base` 路径配置不正确

**解决**: 确保 `vite.config.ts` 中 `base: '/mysterious/'` 与仓库名一致

### 问题 2: 资源加载失败

**原因**: 静态资源路径错误

**解决**: 
- 检查 `base` 配置
- 确保资源文件在 `public/` 目录

### 问题 3: Actions 权限错误

**原因**: 工作流权限不足

**解决**: 
1. 访问 Settings → Actions → General
2. 启用 "Read and write permissions"

## 📊 项目结构

```
mysterious/
├── .github/
│   └── workflows/
│       └── deploy.yml        # GitHub Actions 工作流
├── public/
│   └── .nojekyll            # 禁用 Jekyll
├── src/
│   ├── App.tsx              # 主应用组件
│   ├── components/          # 组件目录
│   └── ...
├── build/                   # 构建输出 (gitignore)
├── vite.config.ts          # Vite 配置
├── package.json
└── README.md
```

## 🔄 更新部署

修改代码后：

```bash
git add .
git commit -m "update: 你的更新说明"
git push origin main
```

GitHub Actions 会自动重新部署。

## 📝 版本记录

- **v0.1.0** (2025-11-05): 初始部署，实现小六壬排盘核心功能

---

**部署完成后，记得在 README.md 中添加线上演示链接！** 🎉




