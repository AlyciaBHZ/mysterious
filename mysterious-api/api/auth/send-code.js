/**
 * 发送短信验证码
 * POST /api/auth/send-code
 * Body: { phone }
 */

import { randomBytes } from 'node:crypto';
import { hasRedis, redisCmd, redisMultiExec } from '../_upstash.js';
import { applyCors } from '../_cors.js';

// 内存存储（无 Redis 时的备用）
const memoryCodeStore = new Map();

function getClientIp(req) {
  const xff = req.headers['x-forwarded-for'];
  if (typeof xff === 'string' && xff.length > 0) return xff.split(',')[0].trim();
  const xr = req.headers['x-real-ip'];
  if (typeof xr === 'string' && xr.length > 0) return xr.trim();
  return 'unknown';
}

// 限流：每个 IP 每分钟最多 3 次
async function rateLimitSendCode(req) {
  const ip = getClientIp(req);
  const windowSec = 60;
  const limit = 3;
  const key = `rl:sms:${ip}:${Math.floor(Date.now() / 1000 / windowSec)}`;

  if (hasRedis()) {
    const res = await redisMultiExec([
      ['INCR', key],
      ['EXPIRE', key, String(windowSec)],
    ]);
    const count = Array.isArray(res) && res[0] && 'result' in res[0] ? Number(res[0].result) : 0;
    return { ok: count <= limit };
  }

  globalThis.__rlSms = globalThis.__rlSms || new Map();
  const store = globalThis.__rlSms;
  const count = (store.get(key) || 0) + 1;
  store.set(key, count);
  return { ok: count <= limit };
}

// 生成6位数字验证码
function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// 发送短信（需要配置短信服务）
async function sendSms(phone, code) {
  // TODO: 接入阿里云短信或腾讯云短信
  // 示例：阿里云短信 API
  // const China = require('@alicloud/dysmsapi20170525');
  // const client = new China.default({ ... });
  // await client.sendSms({ PhoneNumbers: phone, SignName: '神秘排盘', TemplateCode: 'SMS_xxx', TemplateParam: JSON.stringify({ code }) });
  
  // 开发模式：打印验证码到控制台
  console.log(`📱 [SMS] 手机号: ${phone}, 验证码: ${code}`);
  
  // 生产环境需要取消下面的注释并配置短信服务
  // throw new Error('短信服务未配置');
  
  return true;
}

export default async function handler(req, res) {
  const cors = applyCors(req, res, { methods: 'POST, OPTIONS', headers: 'Content-Type' });
  if (cors.handled) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // 限流检查
    const rl = await rateLimitSendCode(req);
    if (!rl.ok) {
      return res.status(429).json({ ok: false, message: '发送过于频繁，请稍后再试' });
    }

    const phone = String(req.body?.phone || '').trim();

    // 验证手机号格式（中国大陆）
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ ok: false, message: '请输入正确的手机号' });
    }

    // 生成验证码
    const code = generateCode();
    const expireSeconds = 300; // 5分钟有效

    // 存储验证码
    if (hasRedis()) {
      const codeKey = `sms:code:${phone}`;
      await redisCmd(['SET', codeKey, code, 'EX', String(expireSeconds)]);
    } else {
      // 内存存储
      memoryCodeStore.set(phone, {
        code,
        expiresAt: Date.now() + expireSeconds * 1000,
      });
    }

    // 发送短信
    try {
      await sendSms(phone, code);
    } catch (smsErr) {
      console.error('SMS send error:', smsErr);
      return res.status(500).json({ ok: false, message: '短信发送失败，请稍后重试' });
    }

    return res.json({ ok: true, message: '验证码已发送' });

  } catch (err) {
    console.error('send-code error:', err);
    return res.status(500).json({
      ok: false,
      message: err && typeof err === 'object' && 'message' in err ? String(err.message) : '服务器错误',
    });
  }
}

// 导出内存存储供 login-phone 使用
export { memoryCodeStore };
