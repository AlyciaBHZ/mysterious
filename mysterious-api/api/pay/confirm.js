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
import { creditQuotaIdempotent } from '../_billing.js';
import { getPlan } from '../_plans.js';
import { applyCors } from '../_cors.js';
 
function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY || '';
  if (!key) throw new Error('Server misconfigured: STRIPE_SECRET_KEY is missing');
  return new Stripe(key, { apiVersion: '2025-01-27.acacia' });
}
 
export default async function handler(req, res) {
  const cors = applyCors(req, res, { methods: 'GET, OPTIONS', headers: 'Content-Type, Authorization, X-Requested-With' });
  if (cors.handled) return;
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

    // Verify amount matches our server-side plan table (prevents metadata tampering)
    const expected = getPlan(planId);
    if (!expected) {
      return res.status(400).json({ ok: false, message: '订单套餐无效' });
    }
    if (checkout.currency && String(checkout.currency).toLowerCase() !== 'cny') {
      return res.status(400).json({ ok: false, message: '订单币种异常' });
    }
    if (typeof checkout.amount_total === 'number' && checkout.amount_total !== expected.amount_cny_fen) {
      return res.status(400).json({ ok: false, message: '订单金额异常' });
    }
 
    const credited = await creditQuotaIdempotent({ uid, sessionId, planId, quota });
    return res.json({ ok: true, ...credited });
  } catch (err) {
    console.error('pay confirm error:', err);
    return res.status(500).json({
      ok: false,
      message: err && typeof err === 'object' && 'message' in err ? String(err.message) : '服务器错误',
    });
  }
}
 
