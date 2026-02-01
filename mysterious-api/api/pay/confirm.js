/**
 * Confirm Stripe Checkout Session after redirect (no webhook required).
 *
 * GET /api/pay/confirm?session_id=cs_...
 * Authorization: Bearer <sessionToken>
 *
 * Idempotent: processed sessions are recorded.
 *
 * Returns: { ok, added, plan, total, remaining }
 */
 
import Stripe from 'stripe';
import { getSessionFromRequest } from '../_session.js';
import { hasRedis, redisCmd } from '../_upstash.js';
import { memoryUsers } from '../_memoryStore.js';
 
function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Max-Age', '86400');
}
 
function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY || '';
  if (!key) throw new Error('Server misconfigured: STRIPE_SECRET_KEY is missing');
  return new Stripe(key, { apiVersion: '2025-01-27.acacia' });
}
 
async function creditQuotaRedis(uid, planId, add) {
  const userKey = `user:${uid}`;
  const lua = `
local key = KEYS[1]
local add = tonumber(ARGV[1])
local plan = ARGV[2]
local existingPlan = redis.call("HGET", key, "plan")
local total = tonumber(redis.call("HGET", key, "total") or "0")
local remaining = tonumber(redis.call("HGET", key, "remaining") or "0")
total = total + add
remaining = remaining + add
redis.call("HSET", key, "plan", plan, "total", tostring(total), "remaining", tostring(remaining))
return {plan, total, remaining, existingPlan}
`.trim();
 
  const result = await redisCmd(['EVAL', lua, '1', userKey, String(add), String(planId)]);
  const [plan, total, remaining] = Array.isArray(result) ? result : [planId, 0, 0];
  return { plan, total: Number(total), remaining: Number(remaining) };
}
 
export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
 
  const session = getSessionFromRequest(req);
  if (!session) return res.status(401).json({ ok: false, message: '未登录' });
 
  const sessionId = String(req.query?.session_id || '').trim();
  if (!sessionId) return res.status(400).json({ ok: false, message: '缺少 session_id' });
 
  try {
    const stripe = getStripe();
    const checkout = await stripe.checkout.sessions.retrieve(sessionId);
 
    if (checkout.payment_status !== 'paid') {
      return res.status(400).json({ ok: false, message: '订单未支付完成' });
    }
 
    const meta = checkout.metadata || {};
    const uid = meta.uid;
    const planId = meta.planId || 'paid';
    const quota = Number(meta.quota || 0);
 
    if (!uid || uid !== session.uid) {
      return res.status(403).json({ ok: false, message: '订单不属于当前用户' });
    }
    if (!Number.isFinite(quota) || quota <= 0) {
      return res.status(500).json({ ok: false, message: '订单额度信息异常' });
    }
 
    // Idempotency
    const processedKey = `pay:processed:${sessionId}`;
    if (hasRedis()) {
      const ok = await redisCmd(['SET', processedKey, '1', 'NX']);
      if (ok !== 'OK') {
        // already processed; return current quota
        const values = await redisCmd(['HMGET', `user:${uid}`, 'plan', 'total', 'remaining']);
        const [p, t, r] = Array.isArray(values) ? values : [];
        return res.json({ ok: true, added: 0, plan: p, total: Number(t || 0), remaining: Number(r || 0), idempotent: true });
      }
 
      const credited = await creditQuotaRedis(uid, planId, quota);
      return res.json({ ok: true, added: quota, ...credited });
    }
 
    // Memory fallback
    const u = memoryUsers.get(uid) || { plan: 'free', total: 3, remaining: 3 };
    const seen = u._processed || new Set();
    if (seen.has(sessionId)) {
      return res.json({ ok: true, added: 0, plan: u.plan, total: u.total, remaining: u.remaining, idempotent: true });
    }
    seen.add(sessionId);
    u._processed = seen;
    u.plan = planId;
    u.total = Number(u.total || 0) + quota;
    u.remaining = Number(u.remaining || 0) + quota;
    memoryUsers.set(uid, u);
    return res.json({ ok: true, added: quota, plan: u.plan, total: u.total, remaining: u.remaining, storage: 'memory' });
  } catch (err) {
    console.error('pay confirm error:', err);
    return res.status(500).json({
      ok: false,
      message: err && typeof err === 'object' && 'message' in err ? String(err.message) : '服务器错误',
    });
  }
}
 
