# 🚀 Vercel部署指南

## Phase 1: 快速部署（10分钟完成）

### 步骤1：准备API Key

从你的本地前端项目中获取Gemini API Key：
- 位置：`mysterious/src/config.local.ts`
- 找到：`DEFAULT_API_KEY`

### 步骤2：部署到Vercel

#### 方法A：通过Vercel CLI（推荐）

1. **安装Vercel CLI**
```bash
npm install -g vercel
```

2. **登录Vercel**
```bash
vercel login
```

3. **进入API项目目录**
```bash
cd mysterious-api
```

4. **第一次部署（会创建项目）**
```bash
vercel
```

按照提示操作：
- `Set up and deploy "mysterious-api"? [Y/n]` → 按 Y
- `Which scope do you want to deploy to?` → 选择你的账号
- `Link to existing project? [y/N]` → 按 N（第一次）
- `What's your project's name?` → 回车（使用默认 mysterious-api）
- `In which directory is your code located?` → 回车（使用 ./）

5. **设置环境变量**
```bash
vercel env add GEMINI_API_KEY production
# 粘贴你的 API Key

vercel env add GEMINI_MODEL production
# 输入: gemini-2.0-flash

vercel env add ALLOWED_ORIGINS production
# 输入: https://mysterious.lexaverse.dev,http://localhost:3000
```

6. **正式部署**
```bash
vercel --prod
```

部署完成后，你会得到：
- 测试域名：`https://mysterious-api-xxx.vercel.app`
- 生产域名：`https://mysterious-api.vercel.app`

#### 方法B：通过Vercel Dashboard（可视化）

1. 访问 https://vercel.com/new
2. 点击 "Import Git Repository"
3. 如果API代码在GitHub，选择仓库；否则用CLI
4. 在 "Environment Variables" 中添加：
   - `GEMINI_API_KEY`: 你的密钥
   - `GEMINI_MODEL`: gemini-2.0-flash
   - `ALLOWED_ORIGINS`: https://mysterious.lexaverse.dev
5. 点击 "Deploy"

### 步骤3：测试API

```bash
# 测试健康检查
curl https://mysterious-api.vercel.app/api/health

# 测试Gemini代理
curl -X POST https://mysterious-api.vercel.app/api/gemini \
  -H "Content-Type: application/json" \
  -d '{"prompt": "你好", "userToken": "free"}'
```

### 步骤4：更新前端配置

在前端项目中创建API配置文件：

**文件：`mysterious/src/config.api.ts`**
```typescript
// API端点配置
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://mysterious-api.vercel.app/api'
  : 'http://localhost:3000/api';

export { API_BASE_URL };
```

---

## Phase 2: 本地开发测试

### 1. 创建本地环境变量

在 `mysterious-api/` 目录下创建 `.env` 文件：

```bash
# mysterious-api/.env
GEMINI_API_KEY=你的真实APIKey
GEMINI_MODEL=gemini-2.0-flash
ALLOWED_ORIGINS=https://mysterious.lexaverse.dev,http://localhost:3000
```

### 2. 启动本地服务

```bash
cd mysterious-api
vercel dev
```

访问 http://localhost:3000/api/health 测试

### 3. 运行测试脚本

```bash
# 测试本地API
node test.js

# 测试生产API
node test.js https://mysterious-api.vercel.app/api
```

---

## Phase 3: 域名配置（可选）

如果想用自定义域名，如 `api.mysterious.lexaverse.dev`：

1. 在Vercel Dashboard → Settings → Domains
2. 添加域名：`api.mysterious.lexaverse.dev`
3. 在Porkbun添加CNAME记录：
   ```
   api.mysterious.lexaverse.dev → cname.vercel-dns.com
   ```

---

## 🔒 安全检查清单

部署前确认：

- [ ] API Key已从前端代码移除
- [ ] 环境变量已在Vercel设置
- [ ] CORS配置正确（只允许你的域名）
- [ ] `.env` 文件已添加到 `.gitignore`
- [ ] 测试了健康检查接口
- [ ] 测试了Gemini代理接口
- [ ] 测试了限流功能

---

## 📊 监控和日志

### 查看日志
```bash
vercel logs
```

### 查看部署状态
```bash
vercel inspect
```

### Vercel Dashboard
https://vercel.com/dashboard
- 实时日志
- 请求统计
- 错误监控

---

## 🆘 常见问题

### Q1: 部署后API返回500错误
**A**: 检查环境变量是否正确设置
```bash
vercel env ls
```

### Q2: CORS错误
**A**: 确认 `ALLOWED_ORIGINS` 包含你的前端域名

### Q3: Gemini API报错
**A**: 检查API Key是否有效，是否有配额

### Q4: 限流不生效
**A**: 第一次部署需要等待几分钟，边缘函数需要预热

---

## 📞 下一步

部署成功后：
1. 记录你的API域名
2. 开始改造前端（调用Vercel API）
3. 测试完整流程
4. 准备Phase 2（付费功能）

---

**部署完成时间估计：10-15分钟**

有问题随时问我！🚀





