/**
 * Register
 * POST /api/auth/register
 * Body: { email, password }
 */
 
import { randomBytes } from 'node:crypto';
import { hasRedis, redisCmd, redisMultiExec } from '../_upstash.js';
import { hashPassword } from '../_password.js';
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

async function rateLimitRegister(req) {
  const ip = getClientIp(req);
  const windowSec = 60 * 60;
  const limit = 5;
  const key = `rl:register:${ip}:${Math.floor(Date.now() / 1000 / windowSec)}`;

  if (hasRedis()) {
    const res = await redisMultiExec([
      ['INCR', key],
      ['EXPIRE', key, String(windowSec)],
    ]);
    const count = Array.isArray(res) && res[0] && 'result' in res[0] ? Number(res[0].result) : 0;
    return { ok: count <= limit };
  }

  globalThis.__rlRegister = globalThis.__rlRegister || new Map();
  const store = globalThis.__rlRegister;
  const count = (store.get(key) || 0) + 1;
  store.set(key, count);
  return { ok: count <= limit };
}
 
function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}
 
export default async function handler(req, res) {
  const cors = applyCors(req, res, { methods: 'POST, OPTIONS', headers: 'Content-Type, Authorization, X-Requested-With' });
  if (cors.handled) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
 
  try {
    const rl = await rateLimitRegister(req);
    if (!rl.ok) {
      return res.status(429).json({ ok: false, message: '请求过于频繁，请稍后再试' });
    }

    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || '');
 
    if (!email || !email.includes('@')) {
      return res.status(400).json({ ok: false, message: '请输入有效邮箱' });
    }
 
    const passwordHash = hashPassword(password);
    const uid = randomBytes(16).toString('hex');
    const createdAt = new Date().toISOString();
 
    if (hasRedis()) {
      const emailKey = `auth:email:${email}`;
      const ok = await redisCmd(['SET', emailKey, uid, 'NX']);
      if (ok !== 'OK') {
        return res.status(409).json({ ok: false, message: '该邮箱已注册' });
      }
 
      const userKey = `auth:user:${uid}`;
      await redisCmd(['HSET', userKey, 'email', email, 'passwordHash', passwordHash, 'createdAt', createdAt]);
 
      // Initialize quota fields for convenience (promotion: 10 free / month)
      const quotaKey = `user:${uid}`;
      await redisCmd([
        'HSET',
        quotaKey,
        'plan',
        'free',
        'total',
        '10',
        'remaining',
        '10',
        'resetMonth',
        new Date().toISOString().slice(0, 7),
      ]);
 
      const token = signSessionToken({ uid, email });
      return res.json({ ok: true, token, user: { uid, email }, storage: 'redis' });
    }
 
    // Memory fallback
    if (memoryAuthEmailToUid.has(email)) {
      return res.status(409).json({ ok: false, message: '该邮箱已注册' });
    }
    memoryAuthEmailToUid.set(email, uid);
    memoryAuthUsers.set(uid, { email, passwordHash, createdAt });
 
    const token = signSessionToken({ uid, email });
    return res.json({
      ok: true,
      token,
      user: { uid, email },
      storage: 'memory',
      message: '注册成功（注意：未配置 Redis，账号在冷启动后可能丢失）',
    });
  } catch (err) {
    console.error('register error:', err);
    return res.status(500).json({
      ok: false,
      message: err && typeof err === 'object' && 'message' in err ? String(err.message) : '服务器错误',
    });
  }
}
 
