# 🔧 GitHub Pages 配置指南

## 问题现象
- ✅ 本地构建成功
- ✅ gh-pages 分支已推送
- ❌ 网站显示空白或示例版本

## 解决方案：配置 GitHub Pages Source

### 步骤 1：打开设置页面
访问：https://github.com/AlyciaBHZ/mysterious/settings/pages

### 步骤 2：修改 Source 配置

找到 **"Build and deployment"** 部分：

#### 当前错误配置（可能）：
```
Source: GitHub Actions
```

#### 正确配置：
```
Source: Deploy from a branch
Branch: gh-pages
Directory: / (root)
```

### 步骤 3：保存并等待

1. 点击 **Save** 按钮
2. 等待 30-60 秒
3. 页面会显示：
   ```
   Your site is live at https://mysterious.lexaverse.dev/
   ```

### 步骤 4：清除浏览器缓存

访问网站前：
- **Chrome/Edge**: Ctrl + Shift + R (强制刷新)
- **Firefox**: Ctrl + F5
- **Safari**: Cmd + Shift + R

---

## ✅ 验证部署成功

访问 https://mysterious.lexaverse.dev/ 应该看到：

✅ 完整的六宫格排盘界面
✅ 输入 x1 和 x2 后能看到结果
✅ AI 解卦功能可用
✅ 不再显示"核心算法未包含"的警告

---

## 🔍 技术原理

### GitHub 上的代码（main 分支）
```
src/
├── core.logic.example.ts   ← 空实现（GitHub 可见）
└── core.logic.ts           ← 完整实现（.gitignore，不可见）
```

### GitHub Pages 部署（gh-pages 分支）
```
build/
└── assets/
    └── index-B0rzvT7g.js   ← 包含完整功能的混淆代码
```

**工作流程**：
1. 本地运行 `npm run deploy`
2. Vite 使用本地的完整 `core.logic.ts` 构建
3. 构建产物（240KB 混淆 JS）推送到 gh-pages
4. GitHub Pages 从 gh-pages 部署
5. 用户获得完整功能，但看不到源码

---

## 🚀 日常更新流程

```bash
# 修改代码后
npm run deploy   # 自动构建并推送到 gh-pages

# 可选：提交源码（不包含 core.logic.ts）
git add .
git commit -m "feat: 更新"
git push origin main
```

---

## ❓ 常见问题

### Q: 网站还是显示空白？
A: 等待 1-2 分钟，GitHub Pages 需要时间重新部署

### Q: 显示"核心算法未包含"？
A: 检查 GitHub Pages Source 是否设置为 gh-pages 分支

### Q: 别人能看到我的算法吗？
A: 不能。gh-pages 只有混淆后的 JS，难以逆向。main 分支只有空实现。

### Q: API Key 安全吗？
A: 安全。config.local.ts 在 .gitignore 中，构建时会被打包但看不到明文。

---

## 📞 需要帮助？

如果以上步骤完成后仍有问题，请检查：

1. GitHub Pages 状态：https://github.com/AlyciaBHZ/mysterious/deployments
2. gh-pages 分支内容：https://github.com/AlyciaBHZ/mysterious/tree/gh-pages
3. 确认 CNAME 文件存在且包含：`mysterious.lexaverse.dev`

