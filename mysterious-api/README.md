# 小六壬排盘 - API服务

## 🎯 目的

保护Gemini API Key，实现用户额度管理和付费功能。

## 📋 API列表

### 1. `/api/health` - 健康检查
```bash
GET /api/health
```

**响应**：
```json
{
  "status": "ok",
  "timestamp": "2025-11-15T12:00:00.000Z",
  "service": "mysterious-api",
  "version": "1.0.0"
}
```

### 2. `/api/gemini` - AI解卦
```bash
POST /api/gemini
Content-Type: application/json

{
  "prompt": "你的完整prompt",
  "userToken": "free" // 或付费用户token
}
```

**响应（成功）**：
```json
{
  "success": true,
  "result": "AI解卦结果...",
  "remaining": 2,
  "plan": "free"
}
```

**响应（额度不足）**：
```json
{
  "error": "今日免费额度已用完",
  "message": "升级套餐享受更多次数",
  "remaining": 0
}
```

## 🚀 本地开发

1. **安装Vercel CLI**
```bash
npm install -g vercel
```

2. **克隆项目**
```bash
cd mysterious-api
npm install
```

3. **设置环境变量**
```bash
cp .env.example .env
# 编辑 .env，填入你的 GEMINI_API_KEY
```

4. **本地测试**
```bash
vercel dev
```

访问 `http://localhost:3000/api/health` 测试

5. **部署到Vercel**
```bash
vercel --prod
```

## 🔒 环境变量配置

在Vercel Dashboard设置：

- `GEMINI_API_KEY`: 你的Gemini API Key
- `GEMINI_MODEL`: gemini-2.0-flash（默认）
- `ALLOWED_ORIGINS`: https://mysterious.lexaverse.dev,http://localhost:3000

## 📊 开发阶段

### Phase 1: API保护 ✅
- [x] Gemini API代理
- [x] IP限流（3次/天）
- [x] CORS配置

### Phase 2: 付费功能（待开发）
- [ ] 兑换码验证
- [ ] 用户token管理
- [ ] 额度扣减
- [ ] 套餐管理

### Phase 3: 自动化（待开发）
- [ ] Vercel KV存储
- [ ] Gumroad Webhook
- [ ] 用户统计

## 🔗 相关链接

- 前端仓库: https://github.com/alyciabhz/mysterious
- 在线网站: https://mysterious.lexaverse.dev
- Vercel Dashboard: https://vercel.com/dashboard





