/**
 * CORS helper with optional allowlist.
 *
 * Env:
 *  - ALLOWED_ORIGINS: comma-separated origins (e.g. https://mysterious.example.com)
 *
 * Behavior:
 *  - If allowlist is set and request has Origin: only allow matching origins, otherwise 403.
 *  - If no allowlist set: allow all origins ("*") for backward compatibility.
 */
 
function getAllowedOrigins() {
  return (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}
 
export function applyCors(req, res, { methods, headers }) {
  const origin = req.headers?.origin;
  const allowed = getAllowedOrigins();
 
  if (allowed.length > 0 && origin) {
    if (!allowed.includes(origin)) {
      res.statusCode = 403;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ ok: false, message: 'CORS blocked: origin not allowed' }));
      return { handled: true };
    }
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
 
  res.setHeader('Access-Control-Allow-Methods', methods);
  res.setHeader('Access-Control-Allow-Headers', headers);
  res.setHeader('Access-Control-Max-Age', '86400');
 
  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return { handled: true };
  }
 
  return { handled: false };
}
 
