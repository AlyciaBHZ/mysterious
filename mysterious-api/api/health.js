/**
 * 健康检查接口
 */
import { applyCors } from './_cors.js';
import { hasRedis, redisCmd } from './_upstash.js';

export default async function handler(req, res) {
  const cors = applyCors(req, res, { methods: 'GET, OPTIONS', headers: 'Content-Type' });
  if (cors.handled) return;

  const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const payload = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'mysterious-api',
    version: '1.0.0',
    config: {
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
      geminiModel: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
      hasStripeKey: Boolean(process.env.STRIPE_SECRET_KEY),
      hasStripeWebhookSecret: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
      hasAuthTokenSecret: Boolean(process.env.AUTH_TOKEN_SECRET || process.env.AUTH_SECRET),
      hasUserTokenSecret: Boolean(process.env.USER_TOKEN_SECRET || process.env.TOKEN_SECRET),
      hasRedis: hasRedis(),
      allowedOrigins,
      hasWhitelist: Boolean((process.env.WHITELIST_EMAILS || '').trim()),
      sessionTtlDays: Number(process.env.SESSION_TTL_DAYS || 30),
      userTokenTtlDays: Number(process.env.USER_TOKEN_TTL_DAYS || 365),
    },
  };

  // Optional deeper check
  const deep = req.query?.deep === '1';
  if (deep && hasRedis()) {
    try {
      const pong = await redisCmd(['PING']);
      payload.redis = { ok: true, pong: String(pong || '') };
    } catch (e) {
      payload.redis = { ok: false, error: e instanceof Error ? e.message : 'redis error' };
    }
  }

  res.status(200).json(payload);
}

