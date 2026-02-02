/**
 * Gemini API Proxy - 保护API Key，实现额度控制
 * 
 * Phase 1: 基础代理功能
 * Phase 2: 添加额度限制
 * Phase 3: 添加用户验证
 */

import { hasRedis, redisCmd, redisMultiExec } from './_upstash.js';
import { verifyUserToken } from './_auth.js';
import { memoryUsers, memoryChats } from './_memoryStore.js';
import { getSessionFromRequest } from './_session.js';
import { applyCors } from './_cors.js';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '').split(',');
const GEMINI_FALLBACK_MODELS = (process.env.GEMINI_FALLBACK_MODELS ||
  'gemini-2.5-flash,gemini-3-flash,gemini-2.5-flash-lite')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)
  .filter((m) => m !== GEMINI_MODEL);
const MAX_PROMPT_CHARS = 20000;
const MAX_QUESTION_CHARS = 500;

function isLeakedKeyErrorText(text) {
  return typeof text === 'string' && /reported as leaked/i.test(text);
}

function extractRetryDelaySeconds(maybeGeminiError) {
  try {
    const details = maybeGeminiError?.error?.details;
    if (!Array.isArray(details)) return null;
    const retryInfo = details.find((d) => d && d['@type'] === 'type.googleapis.com/google.rpc.RetryInfo');
    const delay = retryInfo?.retryDelay; // e.g. "13s"
    if (typeof delay !== 'string') return null;
    const m = delay.match(/^(\d+)\s*s$/i);
    return m ? Number(m[1]) : null;
  } catch {
    return null;
  }
}

function makeHttpError(statusCode, message, details) {
  const err = new Error(message);
  err.statusCode = statusCode;
  if (details) err.details = details;
  return err;
}

/**
 * CORS处理 - 允许所有来源（Phase 1简化版）
 */
function handleCORS(req, res) {
  // Phase 1: 简单粗暴，允许所有来源
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Max-Age', '86400');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  
  return false;
}

/**
 * 调用Gemini API
 */
async function callGemini(prompt) {
  if (!GEMINI_API_KEY) {
    throw makeHttpError(
      500,
      'Server misconfigured: GEMINI_API_KEY is missing',
      'Set GEMINI_API_KEY in Vercel env (Production) and redeploy.'
    );
  }

  const tryModels = [GEMINI_MODEL, ...GEMINI_FALLBACK_MODELS];
  let lastError = null;

  for (const model of tryModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
  
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
        }),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        let errorJson = null;
        try {
          errorJson = JSON.parse(errorText);
        } catch {
          // ignore
        }

        // Gemini key disabled because it's reported leaked
        if (
          response.status === 403 &&
          (isLeakedKeyErrorText(errorText) || isLeakedKeyErrorText(errorJson?.error?.message))
        ) {
          throw makeHttpError(
            403,
            'Gemini API key is disabled (reported as leaked). Please rotate your key.',
            errorJson || errorText
          );
        }

        // Quota / rate limit exceeded: try fallback models if available
        if (response.status === 429) {
          const retryAfterSeconds = extractRetryDelaySeconds(errorJson);
          throw makeHttpError(
            429,
            `Gemini quota/rate limit exceeded for model "${model}"${retryAfterSeconds ? `, retry after ~${retryAfterSeconds}s` : ''}.`,
            errorJson || errorText
          );
        }

        throw makeHttpError(response.status, `Gemini API Error: ${errorText}`, errorJson || errorText);
      }
  
      const data = await response.json();
  
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Invalid response from Gemini API');
      }
  
      return { text: data.candidates[0].content.parts[0].text, model };
    } catch (err) {
      lastError = err;
      // Only fallback on 429; for other errors, stop immediately.
      if (!(err && typeof err === 'object' && 'statusCode' in err && err.statusCode === 429)) {
        throw err;
      }
    }
  }

  throw lastError || new Error('Gemini API Error: all models failed');
}

/**
 * 游客限流（默认：3 次/天）。
 *
 * - Redis: uses INCR + EXPIRE (durable across instances)
 * - Fallback: in-memory Map (best-effort)
 */
const ipUsage = new Map();
const GUEST_DAILY_LIMIT = 3;

async function checkIPLimit(ip) {
  const today = new Date().toISOString().split('T')[0];

  if (hasRedis()) {
    const key = `rl:guest:${ip}:${today}`;
    const res = await redisMultiExec([
      ['INCR', key],
      ['EXPIRE', key, String(24 * 60 * 60)],
    ]);
    const count = Array.isArray(res) && res[0] && 'result' in res[0] ? Number(res[0].result) : 0;
    if (count > GUEST_DAILY_LIMIT) return { allowed: false, remaining: 0 };
    return { allowed: true, remaining: Math.max(0, GUEST_DAILY_LIMIT - count) };
  }

  const key = `${ip}:${today}`;
  const count = ipUsage.get(key) || 0;
  if (count >= GUEST_DAILY_LIMIT) return { allowed: false, remaining: 0 };
  ipUsage.set(key, count + 1);
  return { allowed: true, remaining: Math.max(0, GUEST_DAILY_LIMIT - (count + 1)) };
}

function getWhitelistEmails() {
  return (process.env.WHITELIST_EMAILS || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

function currentMonth() {
  return new Date().toISOString().slice(0, 7); // YYYY-MM
}

const MONTHLY_FREE_TOTAL = 10;

const SESSION_DECR_LUA = `
local key = KEYS[1]
local month = ARGV[1]
local freeTotal = tonumber(ARGV[2])
local isWhitelist = ARGV[3]

if isWhitelist == "1" then
  return {999999, "whitelist", 999999}
end

local plan = redis.call("HGET", key, "plan")
if (not plan) then
  plan = "free"
  redis.call("HSET", key, "plan", plan)
end

-- monthly reset for free users
if plan == "free" then
  local resetMonth = redis.call("HGET", key, "resetMonth")
  if (not resetMonth) or resetMonth ~= month then
    redis.call("HSET", key, "resetMonth", month, "total", tostring(freeTotal), "remaining", tostring(freeTotal))
  end
end

local rem = redis.call("HGET", key, "remaining")
if (not rem) then
  if plan == "free" then
    rem = freeTotal
    redis.call("HSET", key, "total", tostring(freeTotal), "remaining", tostring(freeTotal), "resetMonth", month)
  else
    rem = 0
  end
end
rem = tonumber(rem) or 0

if rem <= 0 then
  return {0, plan, tonumber(redis.call("HGET", key, "total") or "0")}
end

local newrem = redis.call("HINCRBY", key, "remaining", -1)
local total = tonumber(redis.call("HGET", key, "total") or "0")
return {newrem, plan, total}
`.trim();

async function consumeSessionQuota({ uid, isWhitelist }) {
  if (hasRedis()) {
    const key = `user:${uid}`;
    const result = await redisCmd([
      'EVAL',
      SESSION_DECR_LUA,
      '1',
      key,
      currentMonth(),
      String(MONTHLY_FREE_TOTAL),
      isWhitelist ? '1' : '0',
    ]);
    const [remaining, plan, total] = Array.isArray(result) ? result : [];
    return { remaining: Number(remaining || 0), plan: String(plan || 'free'), total: Number(total || 0), storage: 'redis' };
  }

  // Memory fallback
  if (isWhitelist) return { remaining: 999999, plan: 'whitelist', total: 999999, storage: 'memory' };
  const month = currentMonth();
  const u = memoryUsers.get(uid) || { plan: 'free', total: MONTHLY_FREE_TOTAL, remaining: MONTHLY_FREE_TOTAL, resetMonth: month };

  if ((u.plan || 'free') === 'free' && u.resetMonth !== month) {
    u.plan = 'free';
    u.total = MONTHLY_FREE_TOTAL;
    u.remaining = MONTHLY_FREE_TOTAL;
    u.resetMonth = month;
  }

  if (Number(u.remaining || 0) <= 0) {
    memoryUsers.set(uid, u);
    return { remaining: 0, plan: u.plan || 'free', total: Number(u.total || 0), storage: 'memory' };
  }

  u.remaining = Number(u.remaining || 0) - 1;
  memoryUsers.set(uid, u);
  return { remaining: u.remaining, plan: u.plan || 'free', total: Number(u.total || 0), storage: 'memory' };
}

async function refundSessionQuota(uid) {
  if (hasRedis()) {
    try {
      await redisCmd(['HINCRBY', `user:${uid}`, 'remaining', '1']);
    } catch {
      // ignore
    }
    return;
  }
  const u = memoryUsers.get(uid);
  if (!u) return;
  u.remaining = Number(u.remaining || 0) + 1;
  memoryUsers.set(uid, u);
}

const PAID_DECR_LUA = `
local key = KEYS[1]
local rem = redis.call("HGET", key, "remaining")
if (not rem) then
  return {-1, "NOUSER", 0}
end
rem = tonumber(rem)
if (not rem) then
  return {-1, "BADUSER", 0}
end
if (rem <= 0) then
  return {0, "NOQUOTA", 0}
end
local newrem = redis.call("HINCRBY", key, "remaining", -1)
local plan = redis.call("HGET", key, "plan")
local total = redis.call("HGET", key, "total")
return {newrem, plan, total}
`.trim();

async function consumePaidQuota(uid) {
  if (hasRedis()) {
    const userKey = `user:${uid}`;
    const result = await redisCmd(['EVAL', PAID_DECR_LUA, '1', userKey]);
    const [remaining, plan, total] = Array.isArray(result) ? result : [];
    return {
      remaining: Number(remaining ?? 0),
      plan: String(plan ?? ''),
      total: Number(total ?? 0),
      storage: 'redis',
    };
  }

  const u = memoryUsers.get(uid);
  if (!u) return { remaining: -1, plan: 'NOUSER', total: 0, storage: 'memory' };
  if (u.remaining <= 0) return { remaining: 0, plan: 'NOQUOTA', total: u.total, storage: 'memory' };
  u.remaining -= 1;
  memoryUsers.set(uid, u);
  return { remaining: u.remaining, plan: u.plan, total: u.total, storage: 'memory' };
}

async function refundPaidQuota(uid) {
  if (hasRedis()) {
    const userKey = `user:${uid}`;
    try {
      await redisCmd(['HINCRBY', userKey, 'remaining', '1']);
    } catch {
      // ignore refund failure
    }
    return;
  }

  const u = memoryUsers.get(uid);
  if (!u) return;
  u.remaining += 1;
  memoryUsers.set(uid, u);
}

/**
 * 主处理函数
 */
export default async function handler(req, res) {
  const cors = applyCors(req, res, { methods: 'POST, OPTIONS', headers: 'Content-Type, Authorization, X-Requested-With' });
  if (cors.handled) return;
  
  // 只接受POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { prompt, userToken, question } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (typeof prompt !== 'string' || prompt.length > MAX_PROMPT_CHARS) {
      return res.status(400).json({ error: 'Prompt too large', message: '请求内容过长，请缩短后重试' });
    }

    if (question && typeof question === 'string' && question.length > MAX_QUESTION_CHARS) {
      return res.status(400).json({ error: 'Question too large', message: '问题过长，请缩短后重试' });
    }
    
    // Promotion rule:
    // - If logged-in (session token), use per-user monthly quota (10/month) and whitelist exemption.
    // - Else: fallback to legacy flows (paid userToken, or IP-limit for anonymous free).
    const session = getSessionFromRequest(req);
    const whitelist = getWhitelistEmails();
    const isWhitelist = Boolean(session && whitelist.includes(String(session.email).toLowerCase()));

    if (session) {
      const q = await consumeSessionQuota({ uid: session.uid, isWhitelist });
      if (q.plan !== 'whitelist' && q.remaining <= 0) {
        return res.status(429).json({
          error: '额度不足',
          message: '本月免费次数已用完，请购买套餐继续使用（白名单用户不计费）',
          remaining: 0,
          plan: q.plan,
          total: q.total,
        });
      }

      try {
        const { text: result, model } = await callGemini(prompt);

        // Save chat history (best-effort)
        if (question && typeof question === 'string') {
          const title = String(question).trim().slice(0, 32) || '未命名问题';
          const record = {
            id: String(Date.now()) + '-' + Math.random().toString(16).slice(2),
            createdAt: new Date().toISOString(),
            title,
            question: String(question),
            answer: result,
            plan: q.plan,
          };
          if (hasRedis()) {
            try {
              await redisCmd(['SET', `chat:${session.uid}:${record.id}`, JSON.stringify(record)]);
              await redisCmd(['LPUSH', `chat:list:${session.uid}`, record.id]);
              await redisCmd(['LTRIM', `chat:list:${session.uid}`, '0', '49']);
            } catch {
              // ignore
            }
          } else {
            const arr = memoryChats.get(session.uid) || [];
            arr.unshift(record);
            memoryChats.set(session.uid, arr.slice(0, 50));
          }
        }

        return res.json({
          success: true,
          result,
          remaining: q.remaining,
          plan: q.plan,
          total: q.total,
          model,
          storage: q.storage,
        });
      } catch (e) {
        // If we charged a quota (non-whitelist), refund on failure
        if (!isWhitelist) {
          await refundSessionQuota(session.uid);
        }
        throw e;
      }
    }

    // Legacy: anonymous guest (IP limit) / Phase 2 paid userToken
    if (!userToken || userToken === 'free') {
      // 游客：IP限流（2-3次，默认3次/天）
      const ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';
      const limitCheck = await checkIPLimit(ip);
      
      if (!limitCheck.allowed) {
        return res.status(429).json({
          error: '游客额度已用完',
          message: '游客额度已用完（每天3次）。登录可获得每月10次免费，且可保存历史。',
          remaining: 0,
          total: 3,
          plan: 'guest',
        });
      }
      
      // 调用Gemini
      const { text: result, model } = await callGemini(prompt);
      
      return res.json({
        success: true,
        result,
        remaining: limitCheck.remaining,
        total: 3,
        plan: 'guest',
        model,
      });
    }
    
    // Phase 2: 付费用户逻辑（token + 服务端扣减）
    const tokenPayload = verifyUserToken(userToken);
    if (!tokenPayload) {
      return res.status(401).json({
        error: 'Invalid token',
        message: '无效的用户凭证，请重新兑换兑换码',
      });
    }

    const uid = tokenPayload.uid;
    const quota = await consumePaidQuota(uid);

    if (quota.plan === 'NOUSER') {
      return res.status(401).json({
        error: 'User not found',
        message: '用户不存在或已过期，请重新兑换',
      });
    }

    if (quota.plan === 'NOQUOTA' || quota.remaining <= 0) {
      return res.status(429).json({
        error: '额度不足',
        message: '您的解卦次数已用完，请购买新套餐继续使用',
        remaining: 0,
        plan: 'paid',
      });
    }

    try {
      const { text: result, model } = await callGemini(prompt);

      return res.json({
        success: true,
        result,
        remaining: quota.remaining,
        plan: quota.plan,
        total: quota.total,
        model,
        storage: quota.storage,
      });
    } catch (e) {
      // 失败则退回一次额度（尽量减少“扣了次数但没结果”）
      await refundPaidQuota(uid);
      throw e;
    }
    
  } catch (error) {
    console.error('Gemini API Error:', error);

    const statusCode = (error && typeof error === 'object' && 'statusCode' in error)
      ? error.statusCode
      : 500;

    return res.status(statusCode).json({
      error: 'AI解卦失败',
      message: (error && typeof error === 'object' && 'message' in error && error.message)
        ? error.message
        : '服务器错误，请稍后重试',
      details: (error && typeof error === 'object' && 'details' in error) ? error.details : undefined,
    });
  }
}

