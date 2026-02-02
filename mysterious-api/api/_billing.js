/**
 * Billing helpers: quota crediting with idempotency.
 */
 
import { hasRedis, redisCmd } from './_upstash.js';
import { memoryUsers } from './_memoryStore.js';
 
const CREDIT_LUA = `
local processedKey = KEYS[1]
local userKey = KEYS[2]
local add = tonumber(ARGV[1])
local newPlan = ARGV[2]

local ok = redis.call("SET", processedKey, "1", "NX")
if ok ~= "OK" then
  local p = redis.call("HGET", userKey, "plan") or newPlan
  local t = tonumber(redis.call("HGET", userKey, "total") or "0")
  local r = tonumber(redis.call("HGET", userKey, "remaining") or "0")
  return {0, p, t, r, 1}
end

local currentPlan = redis.call("HGET", userKey, "plan")
if currentPlan == "whitelist" then
  newPlan = "whitelist"
end

local t0 = tonumber(redis.call("HGET", userKey, "total") or "0")
local r0 = tonumber(redis.call("HGET", userKey, "remaining") or "0")
local t = t0 + add
local r = r0 + add

redis.call("HSET", userKey, "plan", newPlan, "total", tostring(t), "remaining", tostring(r))
return {add, newPlan, t, r, 0}
`.trim();
 
export async function creditQuotaIdempotent({ uid, sessionId, planId, quota }) {
  const add = Number(quota);
  if (!Number.isFinite(add) || add <= 0) throw new Error('Invalid quota to credit');
  const plan = String(planId || 'paid');
 
  if (hasRedis()) {
    const processedKey = `pay:processed:${sessionId}`;
    const userKey = `user:${uid}`;
    const result = await redisCmd(['EVAL', CREDIT_LUA, '2', processedKey, userKey, String(add), plan]);
    const [added, p, total, remaining, idempotent] = Array.isArray(result) ? result : [0, plan, 0, 0, 0];
    return {
      added: Number(added || 0),
      plan: String(p || plan),
      total: Number(total || 0),
      remaining: Number(remaining || 0),
      idempotent: Boolean(Number(idempotent || 0)),
      storage: 'redis',
    };
  }
 
  const u = memoryUsers.get(uid) || { plan: 'free', total: 0, remaining: 0 };
  const seen = u._processed || new Set();
  if (seen.has(sessionId)) {
    return { added: 0, plan: u.plan, total: u.total, remaining: u.remaining, idempotent: true, storage: 'memory' };
  }
  seen.add(sessionId);
  u._processed = seen;
  u.plan = u.plan === 'whitelist' ? 'whitelist' : plan;
  u.total = Number(u.total || 0) + add;
  u.remaining = Number(u.remaining || 0) + add;
  memoryUsers.set(uid, u);
  return { added: add, plan: u.plan, total: u.total, remaining: u.remaining, idempotent: false, storage: 'memory' };
}
 
