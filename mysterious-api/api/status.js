/**
 * User status endpoint (Phase 2 - paid flow)
 *
 * GET /api/status
 * Authorization: Bearer <token>
 *
 * Returns: { ok, plan, total, remaining, activatedAt, storage }
 */
 
import { hasRedis, redisCmd } from './_upstash.js';
import { verifyUserToken } from './_auth.js';
import { memoryUsers } from './_memoryStore.js';
import { applyCors } from './_cors.js';
 
function getBearerToken(req) {
  const h = req.headers?.authorization || req.headers?.Authorization;
  if (typeof h === 'string' && h.toLowerCase().startsWith('bearer ')) {
    return h.slice(7).trim();
  }
  return null;
}
 
export default async function handler(req, res) {
  const cors = applyCors(req, res, { methods: 'GET, OPTIONS', headers: 'Content-Type, Authorization, X-Requested-With' });
  if (cors.handled) return;
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
 
  const token = getBearerToken(req);
  const payload = verifyUserToken(token);
  if (!payload) {
    return res.status(401).json({ ok: false, message: '无效的用户凭证，请重新兑换' });
  }
 
  try {
    const uid = payload.uid;
 
    if (hasRedis()) {
      const userKey = `user:${uid}`;
      const values = await redisCmd(['HMGET', userKey, 'plan', 'total', 'remaining', 'activatedAt']);
      // Upstash returns array: [plan, total, remaining, activatedAt]
      const [plan, total, remaining, activatedAt] = Array.isArray(values) ? values : [];
 
      if (!plan) {
        return res.status(404).json({ ok: false, message: '用户不存在或已过期，请重新兑换' });
      }
 
      return res.json({
        ok: true,
        plan,
        total: Number(total || 0),
        remaining: Number(remaining || 0),
        activatedAt: activatedAt || null,
        storage: 'redis',
      });
    }
 
    const u = memoryUsers.get(uid);
    if (!u) {
      return res.status(404).json({ ok: false, message: '用户不存在或已过期（未配置 Redis）' });
    }
 
    return res.json({
      ok: true,
      plan: u.plan,
      total: u.total,
      remaining: u.remaining,
      activatedAt: u.activatedAt || null,
      storage: 'memory',
    });
  } catch (err) {
    console.error('status error:', err);
    return res.status(500).json({
      ok: false,
      message: err && typeof err === 'object' && 'message' in err ? String(err.message) : '服务器错误',
    });
  }
}
 
