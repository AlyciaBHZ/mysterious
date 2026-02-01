/**
 * Redeem code endpoint (Phase 2 - paid flow)
 *
 * POST /api/redeem
 * Body: { code: string }
 *
 * Returns: { success, token, plan, total, remaining, message, storage }
 */
 
import { randomBytes } from 'node:crypto';
import { hasRedis, redisCmd } from './_upstash.js';
import { signUserToken } from './_auth.js';
import { memoryUsedCodes, memoryUsers } from './_memoryStore.js';
 
function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Max-Age', '86400');
}
 
function loadCodeTable() {
  const raw = process.env.REDEMPTION_CODES_JSON || process.env.REDEEM_CODES_JSON || '';
  if (!raw) return null;
  try {
    const table = JSON.parse(raw);
    return table && typeof table === 'object' ? table : null;
  } catch {
    return null;
  }
}
 
export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
 
  try {
    const { code } = req.body || {};
    const normalized = String(code || '').trim().toUpperCase();
 
    if (!normalized) {
      return res.status(400).json({ success: false, message: '请输入兑换码' });
    }
 
    const codeTable = loadCodeTable();
    if (!codeTable) {
      return res.status(500).json({
        success: false,
        message:
          '服务器未配置兑换码表（REDEMPTION_CODES_JSON）。请在 Vercel 环境变量中配置后 redeploy。',
      });
    }
 
    const info = codeTable[normalized];
    if (!info || typeof info !== 'object') {
      return res.status(400).json({ success: false, message: '兑换码无效，请检查后重试' });
    }
 
    const plan = String(info.plan || '');
    const quota = Number(info.quota);
    if (!plan || !Number.isFinite(quota) || quota <= 0) {
      return res.status(500).json({ success: false, message: '兑换码配置错误，请联系管理员' });
    }
 
    const uid = randomBytes(16).toString('hex');
    const activatedAt = new Date().toISOString();
 
    if (hasRedis()) {
      // Mark code used atomically: SET used:<code> <uid> NX
      const usedKey = `redeem:used:${normalized}`;
      const ok = await redisCmd(['SET', usedKey, uid, 'NX']);
      if (ok !== 'OK') {
        return res.status(400).json({ success: false, message: '此兑换码已被使用' });
      }
 
      const userKey = `user:${uid}`;
      await redisCmd([
        'HSET',
        userKey,
        'plan',
        plan,
        'total',
        String(quota),
        'remaining',
        String(quota),
        'activatedAt',
        activatedAt,
        'activationCode',
        normalized,
      ]);
 
      const token = signUserToken({ uid });
      return res.json({
        success: true,
        token,
        plan,
        total: quota,
        remaining: quota,
        storage: 'redis',
        message: `兑换成功：已激活${plan}，获得${quota}次额度`,
      });
    }
 
    // Memory fallback
    if (memoryUsedCodes.has(normalized)) {
      return res.status(400).json({ success: false, message: '此兑换码已被使用' });
    }
    memoryUsedCodes.add(normalized);
    memoryUsers.set(uid, {
      plan,
      total: quota,
      remaining: quota,
      activatedAt,
      activationCode: normalized,
    });
 
    const token = signUserToken({ uid });
    return res.json({
      success: true,
      token,
      plan,
      total: quota,
      remaining: quota,
      storage: 'memory',
      message: `兑换成功：已激活${plan}，获得${quota}次额度（注意：未配置 Redis，额度在冷启动后可能丢失）`,
    });
  } catch (err) {
    console.error('redeem error:', err);
    return res.status(500).json({
      success: false,
      message: err && typeof err === 'object' && 'message' in err ? String(err.message) : '服务器错误',
    });
  }
}
 
