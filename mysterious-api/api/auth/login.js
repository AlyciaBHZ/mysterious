/**
 * Login
 * POST /api/auth/login
 * Body: { email, password }
 */
 
import { hasRedis, redisCmd, redisMultiExec } from '../_upstash.js';
import { verifyPassword } from '../_password.js';
import { signSessionToken } from '../_session.js';
import { memoryAuthEmailToUid, memoryAuthUsers } from '../_memoryStore.js';
import { applyCors } from '../_cors.js';
 
function getClientIp(req) {
  const xff = req.headers['x-forwarded-for'];
  if (typeof xff === 'string' && xff.length > 0) return xff.split(',')[0].trim();
  const xr = req.headers['x-real-ip'];
  if (typeof xr === 'string' && xr.length > 0) return xr.trim();
  return 'unknown';
}

async function rateLimitLogin(req) {
  const ip = getClientIp(req);
  const windowSec = 15 * 60;
  const limit = 8;
  const key = `rl:login:${ip}:${Math.floor(Date.now() / 1000 / windowSec)}`;

  if (hasRedis()) {
    const res = await redisMultiExec([
      ['INCR', key],
      ['EXPIRE', key, String(windowSec)],
    ]);
    const count = Array.isArray(res) && res[0] && 'result' in res[0] ? Number(res[0].result) : 0;
    return { ok: count <= limit, remaining: Math.max(0, limit - count) };
  }

  // memory fallback (best effort)
  globalThis.__rlLogin = globalThis.__rlLogin || new Map();
  const store = globalThis.__rlLogin;
  const count = (store.get(key) || 0) + 1;
  store.set(key, count);
  return { ok: count <= limit, remaining: Math.max(0, limit - count) };
}
 
function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}
 
export default async function handler(req, res) {
  const cors = applyCors(req, res, { methods: 'POST, OPTIONS', headers: 'Content-Type, Authorization, X-Requested-With' });
  if (cors.handled) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
 
  try {
    const rl = await rateLimitLogin(req);
    if (!rl.ok) {
      return res.status(429).json({ ok: false, message: '请求过于频繁，请稍后再试' });
    }

    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || '');
 
    if (!email || !email.includes('@')) {
      return res.status(400).json({ ok: false, message: '请输入有效邮箱' });
    }
 
    if (hasRedis()) {
      const emailKey = `auth:email:${email}`;
      const uid = await redisCmd(['GET', emailKey]);
      if (!uid) {
        return res.status(401).json({ ok: false, message: '邮箱或密码错误' });
      }
 
      const userKey = `auth:user:${uid}`;
      const values = await redisCmd(['HMGET', userKey, 'email', 'passwordHash']);
      const [storedEmail, passwordHash] = Array.isArray(values) ? values : [];
      if (!storedEmail || !passwordHash) {
        return res.status(401).json({ ok: false, message: '邮箱或密码错误' });
      }
 
      if (!verifyPassword(password, passwordHash)) {
        return res.status(401).json({ ok: false, message: '邮箱或密码错误' });
      }
 
      const token = signSessionToken({ uid: String(uid), email: String(storedEmail) });
      return res.json({ ok: true, token, user: { uid: String(uid), email: String(storedEmail) }, storage: 'redis' });
    }
 
    // Memory fallback
    const uid = memoryAuthEmailToUid.get(email);
    if (!uid) return res.status(401).json({ ok: false, message: '邮箱或密码错误' });
    const u = memoryAuthUsers.get(uid);
    if (!u) return res.status(401).json({ ok: false, message: '邮箱或密码错误' });
    if (!verifyPassword(password, u.passwordHash)) {
      return res.status(401).json({ ok: false, message: '邮箱或密码错误' });
    }
 
    const token = signSessionToken({ uid, email: u.email });
    return res.json({ ok: true, token, user: { uid, email: u.email }, storage: 'memory' });
  } catch (err) {
    console.error('login error:', err);
    return res.status(500).json({
      ok: false,
      message: err && typeof err === 'object' && 'message' in err ? String(err.message) : '服务器错误',
    });
  }
}
 
