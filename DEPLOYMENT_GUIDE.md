# 🚀 部署指南

本指南说明如何将包含核心算法的完整版本部署到生产环境。

---

## ⚠️ 重要提醒

本指南**仅供项目维护者**使用。公开仓库中不包含核心算法文件（`core.logic.ts`）。

---

## 📋 部署前准备

### 1. 确认文件完整性

确保以下私有文件存在于本地：

- ✅ `src/core.logic.ts` - 核心排盘算法
- ✅ `src/config.local.ts` - API配置

### 2. 检查 .gitignore

确认以下文件已被忽略：

```gitignore
# Local config with API keys
src/config.local.ts

# Core algorithm (proprietary)
src/core.logic.ts
```

### 3. 验证功能

```bash
# 本地测试
npm run dev

# 访问 http://localhost:5173
# 测试排盘功能
# 测试AI解卦功能
```

---

## 🌐 部署到 GitHub Pages

### 方法一：自动部署（推荐）

#### 步骤 1：配置GitHub Actions

文件已创建：`.github/workflows/deploy.yml`

#### 步骤 2：推送代码

```bash
# 添加所有改动（私有文件会被自动忽略）
git add .

# 提交
git commit -m "feat: 更新UI和功能"

# 推送到主分支
git push origin main
```

#### 步骤 3：GitHub Actions自动构建

- GitHub会自动运行workflow
- 编译生产版本（包含核心算法）
- 部署到 `gh-pages` 分支

#### 步骤 4：验证部署

访问 https://mysterious.lexaverse.dev 确认更新成功

---

### 方法二：手动部署

如果需要手动部署：

```bash
# 1. 构建生产版本
npm run build

# 2. 部署到GitHub Pages
npm run deploy

# 3. 验证
# 访问 https://your-username.github.io/mysterious
```

---

## 🔐 安全最佳实践

### 1. 绝不提交私有文件

始终确保以下文件在 `.gitignore` 中：

```bash
# 检查git状态
git status

# 确认私有文件未被追踪
# 应该看到：
# nothing to commit, working tree clean
```

### 2. 定期更新API Key

```bash
# 1. 在 Google AI Studio 中生成新Key
# 2. 更新 src/config.local.ts
# 3. 测试功能
# 4. 重新部署
```

### 3. 监控API使用

- 定期检查 https://aistudio.google.com/app/apikey
- 查看API调用量
- 如发现异常，立即吊销Key

---

## 📝 部署清单

在每次部署前，请确认：

- [ ] 本地功能测试通过
- [ ] 排盘逻辑正常工作
- [ ] AI解卦功能正常
- [ ] 私有文件未被追踪
- [ ] `.gitignore` 配置正确
- [ ] GitHub Actions workflow 正常
- [ ] 自定义域名DNS配置正确

---

## 🔄 更新工作流

### 日常更新

```bash
# 1. 修改代码（UI/文档等）
# 2. 本地测试
npm run dev

# 3. 提交改动
git add .
git commit -m "描述改动"

# 4. 推送（触发自动部署）
git push origin main
```

### 核心算法更新

```bash
# 1. 修改 src/core.logic.ts
# 2. 本地完整测试
npm run dev

# 3. 手动构建
npm run build

# 4. 验证构建产物
# 检查 dist/ 目录

# 5. 手动部署
npm run deploy
```

---

## 🐛 常见问题

### Q1: 部署后排盘功能不工作

**原因**：核心算法文件未包含在构建中

**解决**：
1. 确认本地存在 `src/core.logic.ts`
2. 重新运行 `npm run build`
3. 检查 `dist/` 目录中是否包含编译后的代码

### Q2: GitHub Actions构建失败

**原因**：workflow配置问题或依赖问题

**解决**：
1. 查看 Actions 标签页的错误日志
2. 检查 `package.json` 依赖
3. 确认 Node.js 版本兼容

### Q3: 自定义域名无法访问

**原因**：DNS配置未生效或CNAME文件丢失

**解决**：
1. 确认 `public/CNAME` 文件存在
2. 检查域名DNS设置
3. 等待DNS传播（最多24小时）

---

## 📞 技术支持

如遇到部署问题：

1. 查看 [DEPLOYMENT.md](DEPLOYMENT.md) 详细文档
2. 检查 GitHub Actions 日志
3. 查看浏览器控制台错误
4. 联系项目维护者

---

## 🔗 相关链接

- **GitHub Repository**: https://github.com/your-username/mysterious
- **Live Demo**: https://mysterious.lexaverse.dev
- **Google AI Studio**: https://aistudio.google.com/
- **GitHub Pages 文档**: https://docs.github.com/en/pages

---

**最后更新：2025年**

