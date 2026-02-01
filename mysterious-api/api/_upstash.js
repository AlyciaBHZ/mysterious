/**
 * Minimal Upstash Redis REST helper (no external deps).
 *
 * Supports:
 * - UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN (preferred)
 * - KV_REST_API_URL / KV_REST_API_TOKEN (legacy naming in some templates)
 *
 * If not configured, callers can fall back to in-memory storage.
 */
 
function getRedisConfig() {
  const url =
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.KV_REST_API_URL ||
    process.env.UPSTASH_REDIS_URL || // just in case, though REST URL is required
    '';
 
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.KV_REST_API_TOKEN ||
    process.env.UPSTASH_REDIS_TOKEN ||
    '';
 
  return {
    url: typeof url === 'string' ? url.replace(/\/+$/, '') : '',
    token: typeof token === 'string' ? token : '',
    enabled: Boolean(url && token),
  };
}
 
export function hasRedis() {
  return getRedisConfig().enabled;
}
 
async function redisFetch(path, { method = 'POST', body } = {}) {
  const { url, token, enabled } = getRedisConfig();
  if (!enabled) {
    throw new Error('Upstash Redis is not configured (missing REST URL/TOKEN).');
  }
 
  const res = await fetch(`${url}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
 
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data && data.error) ? String(data.error) : `Upstash error (HTTP ${res.status})`;
    const err = new Error(msg);
    err.statusCode = res.status;
    err.details = data;
    throw err;
  }
 
  if (data && typeof data === 'object' && 'error' in data && data.error) {
    throw new Error(String(data.error));
  }
 
  return data?.result;
}
 
/**
 * Send a Redis command as a JSON array in POST body.
 * Example: redisCmd(["GET", "foo"])
 */
export async function redisCmd(commandArray) {
  if (!Array.isArray(commandArray) || commandArray.length === 0) {
    throw new Error('redisCmd expects a non-empty array');
  }
  return await redisFetch('', { method: 'POST', body: commandArray });
}
 
/**
 * Atomic transaction using Upstash /multi-exec.
 * commands: Array of command arrays.
 */
export async function redisMultiExec(commands) {
  if (!Array.isArray(commands) || commands.length === 0) {
    throw new Error('redisMultiExec expects a non-empty array of commands');
  }
  const result = await redisFetch('/multi-exec', { method: 'POST', body: commands });
  return result;
}
 
