/**
 * Stripe Webhook (primary payment fulfillment).
 *
 * POST /api/pay/webhook
 * Headers:
 *   Stripe-Signature: ...
 *
 * Env:
 *   STRIPE_SECRET_KEY
 *   STRIPE_WEBHOOK_SECRET
 */
 
import Stripe from 'stripe';
import { creditQuotaIdempotent } from '../_billing.js';
import { getPlan } from '../_plans.js';
 
function setCors(res) {
  // Stripe does not require CORS for webhooks, but keep OPTIONS safe.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Stripe-Signature');
  res.setHeader('Access-Control-Max-Age', '86400');
}
 
function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY || '';
  if (!key) throw new Error('Server misconfigured: STRIPE_SECRET_KEY is missing');
  return new Stripe(key, { apiVersion: '2025-01-27.acacia' });
}
 
async function readRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}
 
export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
 
  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
    if (!webhookSecret) {
      return res.status(500).json({ ok: false, message: 'Missing STRIPE_WEBHOOK_SECRET' });
    }
 
    const stripe = getStripe();
    const sig = req.headers['stripe-signature'];
    if (!sig) return res.status(400).json({ ok: false, message: 'Missing Stripe-Signature' });
 
    const rawBody = await readRawBody(req);
    const event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
 
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const sessionId = session.id;
      const meta = session.metadata || {};
      const uid = meta.uid;
      const planId = meta.planId;
      const quota = Number(meta.quota || 0);
 
      if (!uid || !sessionId) {
        return res.status(400).json({ ok: false, message: 'Missing uid/session_id in metadata' });
      }
      if (!Number.isFinite(quota) || quota <= 0) {
        return res.status(400).json({ ok: false, message: 'Invalid quota in metadata' });
      }
 
      const expected = getPlan(planId);
      if (!expected) return res.status(400).json({ ok: false, message: 'Invalid planId' });
 
      if (session.currency && String(session.currency).toLowerCase() !== 'cny') {
        return res.status(400).json({ ok: false, message: 'Unexpected currency' });
      }
      if (typeof session.amount_total === 'number' && session.amount_total !== expected.amount_cny_fen) {
        return res.status(400).json({ ok: false, message: 'Unexpected amount_total' });
      }
 
      const credited = await creditQuotaIdempotent({
        uid,
        sessionId,
        planId: expected.id,
        quota: expected.quota,
      });
 
      return res.json({ ok: true, event: event.type, ...credited });
    }
 
    // For now, acknowledge other event types without action.
    return res.json({ ok: true, ignored: event.type });
  } catch (err) {
    // Stripe expects 2xx for success; return 400 so it retries if signature/processing fails.
    console.error('stripe webhook error:', err);
    return res.status(400).json({
      ok: false,
      message: err && typeof err === 'object' && 'message' in err ? String(err.message) : 'Webhook error',
    });
  }
}
 
