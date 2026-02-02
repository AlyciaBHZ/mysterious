/**
 * 手机号 + 验证码登录（自动注册）
 * POST /api/auth/login-phone
 * Body: { phone, code }
 */

import { randomBytes } from 'node:crypto';
import { hasRedis, redisCmd } from '../_upstash.js';
import { signSessionToken } from '../_session.js';
import { applyCors } from '../_cors.js';
import { memoryCodeStore } from './send-code.js';

// 内存用户存储
const memoryPhoneToUid = new Map();
const memoryUsers = new Map();

function getClientIp(req) {
  const xff = req.headers['x-forwarded-for'];
  if (typeof xff === 'string' && xff.length > 0) return xff.split(',')[0].trim();
  const xr = req.headers['x-real-ip'];
  if (typeof xr === 'string' && xr.length > 0) return xr.trim();
  return 'unknown';
}

// 验证验证码
async function verifyCode(phone, inputCode) {
  if (hasRedis()) {
    const codeKey = `sms:code:${phone}`;
    const storedCode = await redisCmd(['GET', codeKey]);
    if (!storedCode) return { ok: false, reason: 'expired' };
    if (storedCode !== inputCode) return { ok: false, reason: 'invalid' };
    // 验证成功后删除验证码
    await redisCmd(['DEL', codeKey]);
    return { ok: true };
  }

  // 内存验证
  const stored = memoryCodeStore.get(phone);
  if (!stored) return { ok: false, reason: 'expired' };
  if (stored.expiresAt < Date.now()) {
    memoryCodeStore.delete(phone);
    return { ok: false, reason: 'expired' };
  }
  if (stored.code !== inputCode) return { ok: false, reason: 'invalid' };
  memoryCodeStore.delete(phone);
  return { ok: true };
}

export default async function handler(req, res) {
  const cors = applyCors(req, res, { methods: 'POST, OPTIONS', headers: 'Content-Type' });
  if (cors.handled) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const phone = String(req.body?.phone || '').trim();
    const code = String(req.body?.code || '').trim();

    // 验证手机号格式
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ ok: false, message: '请输入正确的手机号' });
    }

    // 验证验证码格式
    if (!/^\d{4,6}$/.test(code)) {
      return res.status(400).json({ ok: false, message: '请输入正确的验证码' });
    }

    // 验证验证码
    const verification = await verifyCode(phone, code);
    if (!verification.ok) {
      const msg = verification.reason === 'expired' ? '验证码已过期，请重新获取' : '验证码错误';
      return res.status(401).json({ ok: false, message: msg });
    }

    let uid;
    let isNew = false;

    if (hasRedis()) {
      // 检查用户是否存在
      const phoneKey = `auth:phone:${phone}`;
      uid = await redisCmd(['GET', phoneKey]);

      if (!uid) {
        // 新用户注册
        isNew = true;
        uid = randomBytes(16).toString('hex');
        const createdAt = new Date().toISOString();

        // 保存用户
        await redisCmd(['SET', phoneKey, uid]);
        const userKey = `auth:user:${uid}`;
        await redisCmd(['HSET', userKey, 'phone', phone, 'createdAt', createdAt]);

        // 初始化额度（推广期：每月10次免费）
        const quotaKey = `user:${uid}`;
        await redisCmd([
          'HSET',
          quotaKey,
          'plan', 'free',
          'total', '10',
          'remaining', '10',
          'resetMonth', new Date().toISOString().slice(0, 7),
        ]);
      }

      const token = signSessionToken({ uid, phone });
      return res.json({ 
        ok: true, 
        token, 
        user: { uid, phone },
        isNew,
        storage: 'redis',
      });
    }

    // 内存模式
    uid = memoryPhoneToUid.get(phone);

    if (!uid) {
      // 新用户
      isNew = true;
      uid = randomBytes(16).toString('hex');
      const createdAt = new Date().toISOString();

      memoryPhoneToUid.set(phone, uid);
      memoryUsers.set(uid, { phone, createdAt });
    }

    const token = signSessionToken({ uid, phone });
    return res.json({
      ok: true,
      token,
      user: { uid, phone },
      isNew,
      storage: 'memory',
      message: isNew ? '注册成功' : '登录成功',
    });

  } catch (err) {
    console.error('login-phone error:', err);
    return res.status(500).json({
      ok: false,
      message: err && typeof err === 'object' && 'message' in err ? String(err.message) : '服务器错误',
    });
  }
}
