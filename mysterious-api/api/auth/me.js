/**
 * Current user
 * GET /api/auth/me
 * Authorization: Bearer <sessionToken>
 */
 
import { getSessionFromRequest } from '../_session.js';
import { hasRedis, redisCmd } from '../_upstash.js';
import { memoryAuthUsers } from '../_memoryStore.js';
import { applyCors } from '../_cors.js';
 
export default async function handler(req, res) {
  const cors = applyCors(req, res, { methods: 'GET, OPTIONS', headers: 'Content-Type, Authorization, X-Requested-With' });
  if (cors.handled) return;
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
 
  try {
    const session = getSessionFromRequest(req);
    if (!session) {
      return res.status(401).json({ ok: false, message: '未登录' });
    }
 
    if (hasRedis()) {
      const userKey = `auth:user:${session.uid}`;
      const values = await redisCmd(['HMGET', userKey, 'email', 'createdAt']);
      const [email, createdAt] = Array.isArray(values) ? values : [];
      return res.json({ ok: true, user: { uid: session.uid, email: email || session.email, createdAt: createdAt || null } });
    }
 
    const u = memoryAuthUsers.get(session.uid);
    return res.json({
      ok: true,
      user: { uid: session.uid, email: u?.email || session.email, createdAt: u?.createdAt || null },
      storage: 'memory',
    });
  } catch (err) {
    console.error('me error:', err);
    return res.status(500).json({
      ok: false,
      message: err && typeof err === 'object' && 'message' in err ? String(err.message) : '服务器错误',
    });
  }
}
 
