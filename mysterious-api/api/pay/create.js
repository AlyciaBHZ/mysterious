/**
 * Create Stripe Checkout Session for WeChat Pay / Alipay.
 *
 * POST /api/pay/create
 * Authorization: Bearer <sessionToken>
 * Body: { planId: "trial"|"basic"|"standard"|"pro" }
 *
 * Returns: { ok, url, id }
 */
 
import Stripe from 'stripe';
import { getSessionFromRequest } from '../_session.js';
import { hasRedis, redisCmd } from '../_upstash.js';
import { memoryUsers } from '../_memoryStore.js';
 
function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Max-Age', '86400');
}
 
const PLANS = {
  trial: { name: '体验包', quota: 20, amount_cny_fen: 600 },
  basic: { name: '基础包', quota: 80, amount_cny_fen: 1900 },
  standard: { name: '超值包', quota: 250, amount_cny_fen: 4900 },
  pro: { name: '专业包', quota: 600, amount_cny_fen: 9900 },
};
 
function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY || '';
  if (!key) throw new Error('Server misconfigured: STRIPE_SECRET_KEY is missing');
  return new Stripe(key, { apiVersion: '2025-01-27.acacia' });
}
 
function getFrontendUrl() {
  return (process.env.FRONTEND_URL || process.env.PUBLIC_APP_URL || '').replace(/\/+$/, '');
}
 
async function getOrCreateStripeCustomerId({ stripe, uid, email }) {
  const key = `billing:${uid}`;
 
  if (hasRedis()) {
    const existing = await redisCmd(['HGET', key, 'stripeCustomerId']);
    if (existing) return String(existing);
    const customer = await stripe.customers.create({ email, metadata: { uid } });
    await redisCmd(['HSET', key, 'stripeCustomerId', customer.id]);
    return customer.id;
  }
 
  const u = memoryUsers.get(uid) || {};
  if (u.stripeCustomerId) return u.stripeCustomerId;
  const customer = await stripe.customers.create({ email, metadata: { uid } });
  u.stripeCustomerId = customer.id;
  memoryUsers.set(uid, u);
  return customer.id;
}
 
export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
 
  const session = getSessionFromRequest(req);
  if (!session) return res.status(401).json({ ok: false, message: '未登录' });
 
  try {
    const planId = String(req.body?.planId || '').trim();
    const plan = PLANS[planId];
    if (!plan) return res.status(400).json({ ok: false, message: '无效套餐' });
 
    const frontendUrl = getFrontendUrl();
    if (!frontendUrl) {
      return res.status(500).json({
        ok: false,
        message: '服务器未配置 FRONTEND_URL（用于支付成功回跳）',
      });
    }
 
    const stripe = getStripe();
    const customerId = await getOrCreateStripeCustomerId({
      stripe,
      uid: session.uid,
      email: session.email,
    });
 
    const checkout = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer: customerId,
      payment_method_types: ['card', 'alipay', 'wechat_pay'],
      payment_method_options: {
        wechat_pay: { client: 'web' },
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'cny',
            unit_amount: plan.amount_cny_fen,
            product_data: {
              name: `小六壬 - ${plan.name}`,
              description: `${plan.quota} 次 AI 解卦额度（用完即止）`,
            },
          },
        },
      ],
      metadata: {
        uid: session.uid,
        email: session.email,
        planId,
        quota: String(plan.quota),
      },
      success_url: `${frontendUrl}/?pay=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/?pay=cancel`,
    });
 
    return res.json({ ok: true, url: checkout.url, id: checkout.id });
  } catch (err) {
    console.error('pay create error:', err);
    return res.status(500).json({
      ok: false,
      message: err && typeof err === 'object' && 'message' in err ? String(err.message) : '服务器错误',
    });
  }
}
 
