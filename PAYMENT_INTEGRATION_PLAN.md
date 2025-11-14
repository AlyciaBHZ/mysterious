# 💰 付费功能集成方案

## 📋 当前架构分析

### 现有优势
- ✅ 前端完整独立
- ✅ API Key 在前端（便于快速迭代）
- ✅ GitHub Pages 托管（零成本）
- ✅ React 架构易于扩展

### 现有限制
- ❌ 无后端（无法验证用户）
- ❌ 无数据库（无法存储订单）
- ❌ API Key 暴露给用户（可能被滥用）

---

## 🎯 推荐实施路线图

### 阶段 0：准备工作（当前完成 ✅）
- [x] 前端完整功能
- [x] 部署到自定义域名
- [x] 核心算法保护

---

### 阶段 1：基础付费功能（1-2周）⭐ 从这里开始

#### 功能设计
```
免费用户：5次/天
付费用户：
  - 基础版：50次/月 - ¥19.9
  - 标准版：200次/月 - ¥49.9
  - 专业版：无限次 - ¥99/月
```

#### 技术实现（无需后端）

**1. 前端添加计数器**
```typescript
// src/services/quotaManager.ts
interface UserQuota {
  plan: 'free' | 'basic' | 'standard' | 'pro';
  remaining: number;
  resetDate: string;
  activationCode?: string;
}

export class QuotaManager {
  private static STORAGE_KEY = 'mysterious_quota';
  
  static getQuota(): UserQuota {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) {
      return { plan: 'free', remaining: 5, resetDate: this.getNextResetDate() };
    }
    return JSON.parse(stored);
  }
  
  static consumeQuota(): boolean {
    const quota = this.getQuota();
    if (quota.remaining <= 0) return false;
    
    quota.remaining--;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(quota));
    return true;
  }
  
  static activateCode(code: string): boolean {
    // 简单的兑换码验证（后期可改为 API 验证）
    const plans: Record<string, { plan: string; quota: number }> = {
      'BASIC2024': { plan: 'basic', quota: 50 },
      'STANDARD2024': { plan: 'standard', quota: 200 },
      'PRO2024': { plan: 'pro', quota: 999999 },
    };
    
    const planInfo = plans[code];
    if (!planInfo) return false;
    
    const quota: UserQuota = {
      plan: planInfo.plan as any,
      remaining: planInfo.quota,
      resetDate: this.getNextResetDate(),
      activationCode: code,
    };
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(quota));
    return true;
  }
  
  private static getNextResetDate(): string {
    const next = new Date();
    next.setMonth(next.getMonth() + 1);
    return next.toISOString();
  }
}
```

**2. UI 组件**
```typescript
// src/components/QuotaDisplay.tsx
export function QuotaDisplay() {
  const quota = QuotaManager.getQuota();
  
  return (
    <div className="quota-card">
      <p>当前套餐：{getPlanName(quota.plan)}</p>
      <p>剩余次数：{quota.remaining}</p>
      {quota.plan === 'free' && (
        <Button onClick={() => setShowUpgrade(true)}>
          升级套餐 🚀
        </Button>
      )}
    </div>
  );
}
```

**3. 支付页面**
```typescript
// src/components/PricingModal.tsx
export function PricingModal() {
  const plans = [
    { 
      name: '基础版', 
      price: '¥19.9/月', 
      quota: 50,
      paymentUrl: 'https://你的支付链接/basic'
    },
    // ... 其他套餐
  ];
  
  return (
    <div className="pricing-grid">
      {plans.map(plan => (
        <PlanCard 
          {...plan}
          onPurchase={() => window.open(plan.paymentUrl)}
        />
      ))}
    </div>
  );
}
```

#### 支付集成（选择一个）

**选项 A：微信/支付宝收款码（最简单）**
```typescript
// 用户点击购买 → 显示收款二维码 → 手动发送兑换码
优点：零技术门槛，今天就能用
缺点：需要手动处理订单
```

**选项 B：爱发卡（半自动化）**
```
网址：https://www.ifaka.com
功能：自动发卡系统
费率：约 0.6%
集成：购买后自动显示兑换码
```

**选项 C：虎皮椒/Xorpay（全自动）**
```typescript
前端 → 虎皮椒支付 → Webhook回调 → 自动激活
费率：约 2%
优点：完全自动化
```

---

### 阶段 2：Serverless 后端（2-3周）

#### 技术选型：Supabase（推荐）

**为什么选 Supabase？**
- ✅ 免费额度充足（5万月活）
- ✅ 包含：数据库 + 认证 + 存储 + 实时订阅
- ✅ 自带 REST API
- ✅ Row Level Security（数据安全）

#### 数据库设计
```sql
-- 用户表
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 订单表
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  plan TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- 用量记录
CREATE TABLE usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL, -- 'divination' | 'ai_reading'
  created_at TIMESTAMP DEFAULT NOW()
);

-- 套餐表
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  plan TEXT NOT NULL,
  quota_total INT NOT NULL,
  quota_used INT DEFAULT 0,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### API 代理（保护你的 API Key）
```typescript
// Cloudflare Workers / Vercel Edge Function
export default async function handler(req: Request) {
  const { userId, question, palaceData } = await req.json();
  
  // 1. 验证用户身份（JWT token）
  const user = await verifyToken(req.headers.get('Authorization'));
  
  // 2. 检查套餐额度
  const subscription = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single();
  
  if (subscription.quota_used >= subscription.quota_total) {
    return new Response('Quota exceeded', { status: 429 });
  }
  
  // 3. 调用 Gemini API（Key 在服务器端，安全）
  const response = await callGeminiAPI(question, palaceData);
  
  // 4. 记录用量
  await supabase
    .from('subscriptions')
    .update({ quota_used: subscription.quota_used + 1 })
    .eq('id', subscription.id);
  
  return new Response(JSON.stringify({ result: response }));
}
```

#### 前端改造
```typescript
// src/services/api.ts
export async function requestAIDivination(question: string, palaceData: any) {
  const token = localStorage.getItem('auth_token');
  
  const response = await fetch('https://your-api.workers.dev/divination', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ question, palaceData }),
  });
  
  if (response.status === 429) {
    throw new Error('已达使用上限，请升级套餐');
  }
  
  return response.json();
}
```

---

### 阶段 3：完整商业化（1-2个月）

#### 新增功能
- 用户中心（历史记录、套餐管理）
- 推荐系统（邀请返利）
- 数据分析（占卜趋势、热门问题）
- 移动端 App（React Native）
- 微信小程序

#### 技术架构升级
```
前端：Next.js（SEO 优化）
后端：Node.js + Express
数据库：PostgreSQL
缓存：Redis
支付：微信支付 + 支付宝
监控：Sentry + Google Analytics
```

---

## 💰 成本估算

### 阶段 1（兑换码模式）
- 服务器：¥0（GitHub Pages）
- 支付：手动发卡 ¥0 | 爱发卡 0.6% | 虎皮椒 2%
- **总成本：几乎为零**

### 阶段 2（Serverless）
```
Supabase：¥0（免费版）或 ¥150/月（Pro版）
Cloudflare Workers：¥0（10万请求/天免费）
域名：¥50/年
**预计：¥0-200/月**
```

### 阶段 3（完整后端）
```
服务器：¥300-500/月（腾讯云/阿里云）
数据库：¥100-200/月
CDN：¥50-100/月
**预计：¥500-1000/月**
```

---

## 🚀 立即可以做的事（今天就能上线）

### 1. 添加"升级提示"（30分钟）
```typescript
// App.tsx 中添加
const [usageCount, setUsageCount] = useState(0);

const handleAIDivination = async () => {
  // 检查免费额度
  const todayUsage = getTodayUsage();
  if (todayUsage >= 5) {
    alert('今日免费额度已用完！\n\n升级套餐享受更多次数 👉');
    setShowPricing(true);
    return;
  }
  
  // ... 正常流程
  setUsageCount(todayUsage + 1);
};
```

### 2. 创建定价页面（1小时）
添加 `src/components/PricingPage.tsx`，展示套餐和收款码

### 3. 设置收款码（10分钟）
- 微信/支付宝收款码
- 添加备注说明："购买后联系微信 XXX 获取兑换码"

### 4. 兑换码系统（2小时）
添加兑换入口，用户输入兑换码即可激活套餐

**这4步完成后，你今天就能开始收费！**

---

## 📞 技术支持建议

如果选择：
- **阶段 1**：我可以立即帮你实现（1-2小时）
- **阶段 2**：需要 2-3天完成集成和测试
- **阶段 3**：建议先运营一段时间，确认有持续收入后再投入

---

## 🎯 我的建议

**现在立即做**：
1. ✅ 添加使用次数限制（免费5次/天）
2. ✅ 添加定价页面和收款码
3. ✅ 实现兑换码系统
4. ✅ 开始测试收费（先邀请朋友试用）

**1个月后**：
- 如果有稳定用户和收入 → 升级到阶段2（Serverless）
- 如果还在验证市场 → 保持阶段1，专注优化产品

**3-6个月后**：
- 月收入 > ¥5000 → 考虑阶段3（完整后端）
- 继续小规模 → 保持阶段2（成本最优）

---

需要我现在就帮你实现阶段1的付费功能吗？只需要2-3小时！🚀

