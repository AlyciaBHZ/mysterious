/**
 * Login
 * POST /api/auth/login
 * Body: { email, password }
 */
 
import { hasRedis, redisCmd } from '../_upstash.js';
import { verifyPassword } from '../_password.js';
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
 
