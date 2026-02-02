/**
 * Get current quota for logged-in user (promotion: monthly free quota).
 * GET /api/quota
 * Authorization: Bearer <sessionToken>
 */
 
import { getSessionFromRequest } from './_session.js';
import { hasRedis, redisCmd } from './_upstash.js';
import { memoryUsers } from './_memoryStore.js';
import { applyCors } from './_cors.js';
 
function currentMonth() {
  return new Date().toISOString().slice(0, 7); // YYYY-MM
}
 
async function ensureMonthlyFreeRedis(uid) {
  const key = `user:${uid}`;
  const values = await redisCmd(['HMGET', key, 'plan', 'total', 'remaining', 'resetMonth']);
  const [plan, total, remaining, resetMonth] = Array.isArray(values) ? values : [];
 
  const p = String(plan || 'free');
  const month = currentMonth();
 
  if (p === 'free' && String(resetMonth || '') !== month) {
    await redisCmd(['HSET', key, 'total', '10', 'remaining', '10', 'resetMonth', month, 'plan', 'free']);
    return { plan: 'free', total: 10, remaining: 10, resetMonth: month };
  }
 
  return {
    plan: p,
    total: Number(total || 0),
    remaining: Number(remaining || 0),
    resetMonth: resetMonth || month,
  };
}
 
export default async function handler(req, res) {
  const cors = applyCors(req, res, { methods: 'GET, OPTIONS', headers: 'Content-Type, Authorization, X-Requested-With' });
  if (cors.handled) return;
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
 
  const session = getSessionFromRequest(req);
  if (!session) return res.status(401).json({ ok: false, message: '未登录' });
 
  const wl = (process.env.WHITELIST_EMAILS || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
  if (wl.includes(String(session.email).toLowerCase())) {
    return res.json({ ok: true, plan: 'whitelist', total: 999999, remaining: 999999 });
  }
 
  try {
    if (hasRedis()) {
      const q = await ensureMonthlyFreeRedis(session.uid);
      return res.json({ ok: true, plan: q.plan, total: q.total, remaining: q.remaining });
    }
 
    const u = memoryUsers.get(session.uid) || { plan: 'free', total: 10, remaining: 10, resetMonth: currentMonth() };
    if ((u.plan || 'free') === 'free' && u.resetMonth !== currentMonth()) {
      u.plan = 'free';
      u.total = 10;
      u.remaining = 10;
      u.resetMonth = currentMonth();
      memoryUsers.set(session.uid, u);
    }
    return res.json({ ok: true, plan: u.plan || 'free', total: Number(u.total || 0), remaining: Number(u.remaining || 0), storage: 'memory' });
  } catch (err) {
    console.error('quota error:', err);
    return res.status(500).json({ ok: false, message: err && typeof err === 'object' && 'message' in err ? String(err.message) : '服务器错误' });
  }
}
 
