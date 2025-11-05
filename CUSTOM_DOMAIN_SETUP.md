# 自定义域名配置指南

## ✅ 当前配置

- **自定义域名**: `mysterious.lexaverse.dev`
- **GitHub Pages 地址**: `alyciabhz.github.io/mysterious`
- **DNS 提供商**: Porkbun

## 🌐 DNS 配置（已完成）

在 Porkbun 中配置的记录：

### CNAME 记录
```
Type: CNAME
Host: mysterious.lexaverse.dev
Answer: alyciabhz.github.io
TTL: 600
```

### A 记录（根域名）
```
Type: A
Host: lexaverse.dev
Answer: 
  - 185.199.108.153
  - 185.199.109.153
  - 185.199.110.153
  - 185.199.111.153
TTL: 3600
```

✅ **DNS 解析状态**: 正常！已验证 `mysterious.lexaverse.dev` 正确解析到 GitHub Pages IP。

## 📝 项目配置（已完成）

### 1. CNAME 文件
已创建 `public/CNAME` 文件，内容：
```
mysterious.lexaverse.dev
```

### 2. Vite 配置
已更新 `vite.config.ts`：
```typescript
export default defineConfig({
  base: '/',  // 使用自定义域名，无需子路径
  // ...
});
```

### 3. README 更新
已更新项目文档，使用新的域名链接。

## 🚀 GitHub Pages 设置步骤

### 步骤 1: 推送 CNAME 文件

```bash
git add .
git commit -m "feat: add custom domain configuration"
git push origin main
```

**✅ 已完成！**

### 步骤 2: 等待部署完成

1. 访问 https://github.com/AlyciaBHZ/mysterious/actions
2. 等待 "Deploy to GitHub Pages" 工作流完成（绿色勾号）
3. 大约需要 2-3 分钟

### 步骤 3: 在 GitHub 设置自定义域名

1. 访问：https://github.com/AlyciaBHZ/mysterious/settings/pages

2. 在 **Custom domain** 输入框填写：
   ```
   mysterious.lexaverse.dev
   ```

3. 点击 **Save**

4. 等待 DNS 检查（可能需要几分钟）

5. ✅ **勾选** "Enforce HTTPS"（在 DNS 检查通过后）

### 步骤 4: 验证访问

等待几分钟后，访问：
```
🔗 https://mysterious.lexaverse.dev
```

## 🔍 DNS 验证命令

检查 DNS 解析：
```bash
nslookup mysterious.lexaverse.dev
```

应该返回：
```
Name:    alyciabhz.github.io
Addresses:  185.199.108.153
           185.199.109.153
           185.199.110.153
           185.199.111.153
Aliases:  mysterious.lexaverse.dev
```

✅ **已验证通过！**

## 📊 故障排除

### 问题 1: DNS check unsuccessful

**可能原因**：
1. DNS 记录还在传播中（最多 48 小时，通常几分钟）
2. CNAME 文件未正确部署
3. GitHub Pages 缓存问题

**解决方案**：
1. 等待 5-10 分钟，刷新 GitHub Pages 设置页面
2. 检查 Actions 是否部署成功
3. 确认 `public/CNAME` 文件已推送

### 问题 2: 页面显示 404

**可能原因**：
1. 部署尚未完成
2. base 路径配置错误

**解决方案**：
1. 等待部署完成
2. 确认 `vite.config.ts` 中 `base: '/'`
3. 清除浏览器缓存

### 问题 3: HTTPS 不可用

**可能原因**：
1. DNS 检查未通过
2. SSL 证书还在生成中

**解决方案**：
1. 等待 DNS 检查通过（绿色勾号）
2. 勾选 "Enforce HTTPS"
3. 等待几分钟让 GitHub 生成证书

## 🔐 HTTPS 配置

GitHub Pages 会自动为自定义域名提供免费的 SSL 证书（Let's Encrypt）。

**启用步骤**：
1. 等待 DNS 检查通过
2. 在 Settings → Pages 勾选 **"Enforce HTTPS"**
3. 等待 5-15 分钟
4. 访问 `https://mysterious.lexaverse.dev`

## 📝 配置检查清单

```
✅ DNS CNAME 记录配置完成
✅ public/CNAME 文件已创建
✅ vite.config.ts base 路径已更新
✅ 代码已推送到 GitHub
□ 等待 Actions 部署完成
□ 在 GitHub Pages 设置自定义域名
□ DNS 检查通过（绿色勾号）
□ 启用 HTTPS
□ 访问网站验证
```

## 🎯 最终目标

- ✅ HTTP 访问: `http://mysterious.lexaverse.dev`
- ⏳ HTTPS 访问: `https://mysterious.lexaverse.dev`（DNS 检查通过后）
- ✅ 原地址重定向: `alyciabhz.github.io/mysterious` → `mysterious.lexaverse.dev`

## 🔄 更新流程

后续更新代码：

```bash
git add .
git commit -m "你的更新说明"
git push origin main
```

GitHub Actions 会自动部署，CNAME 文件会自动包含在构建中。

---

**🎊 恭喜！你的专属域名即将上线！**

需要帮助？参考 GitHub Pages 官方文档：
https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site

