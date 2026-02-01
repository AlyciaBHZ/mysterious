/**
 * Register
 * POST /api/auth/register
 * Body: { email, password }
 */
 
import { randomBytes } from 'node:crypto';
import { hasRedis, redisCmd } from '../_upstash.js';
import { hashPassword } from '../_password.js';
import { signSessionToken } from '../_session.js';
import { memoryAuthEmailToUid, memoryAuthUsers } from '../_memoryStore.js';
 
function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Max-Age', '86400');
}
 
function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}
 
export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
 
  try {
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
 
      // Initialize quota fields for convenience
      const quotaKey = `user:${uid}`;
      await redisCmd([
        'HSET',
        quotaKey,
        'plan',
        'free',
        'total',
        '3',
        'remaining',
        '3',
        'resetDate',
        new Date().toISOString().split('T')[0],
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
 
