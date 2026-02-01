# 部署与域名（维护者文档）

本仓库是**半开源**项目：公开 `main` 分支只包含 UI/交互等开源部分；生产站点包含私有实现与运行配置。

## 架构概览

- **前端**：Vite 静态站点 → GitHub Pages（可绑定自定义域名）
- **后端**：`mysterious-api/` → Vercel Serverless Functions（AI 代理、用户、历史、支付）

## 前端（GitHub Pages）

- 构建：`npm run build`
- 部署：仓库已配置 GitHub Actions（见 `.github/workflows/deploy.yml`）
- 自定义域名：
  - 根目录 `CNAME` 或 `public/CNAME` 中配置域名
  - 在 GitHub 仓库 Settings → Pages 中设置 Custom domain 并开启 Enforce HTTPS
  - DNS 侧配置 CNAME 指向 GitHub Pages（官方文档见 GitHub Pages Custom Domain）

## 后端（Vercel：`mysterious-api/`）

### 必要环境变量（生产）

> 参考 `mysterious-api/.env.example`

- **AI**
  - `GEMINI_API_KEY`
  - `GEMINI_MODEL`（可选）
  - `GEMINI_FALLBACK_MODELS`（可选）
- **用户/会话**
  - `AUTH_TOKEN_SECRET`
  - `USER_TOKEN_SECRET`
- **支付（Stripe，支持微信/支付宝取决于 Stripe 账号与地区能力）**
  - `STRIPE_SECRET_KEY`
  - `FRONTEND_URL`（用于支付成功/取消回跳）
- **存储（推荐）**
  - `UPSTASH_REDIS_REST_URL`
  - `UPSTASH_REDIS_REST_TOKEN`

### 本地开发（API）

在 `mysterious-api/`：

```bash
npm install
npm run dev
```

## 公开仓库安全约定（半开源）

- `src/core.logic.ts` / `src/prompts.config.ts` / `src/config.local.ts` 等私有内容必须保持在 `.gitignore` 中
- 不在文档中写入真实 Key、真实域名账户信息、支付密钥、供应商后台截图

