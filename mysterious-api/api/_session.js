/**
 * Session token signing/verifying for user accounts.
 *
 * Format: base64url(payloadJSON) + "." + base64url(hmacSHA256(payloadB64))
 */
 
import { createHmac, timingSafeEqual } from 'node:crypto';
 
function base64UrlEncode(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}
 
function base64UrlDecodeToString(b64url) {
  const b64 = String(b64url).replace(/-/g, '+').replace(/_/g, '/');
  const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4));
  return Buffer.from(b64 + pad, 'base64').toString('utf8');
}
 
function getSecret() {
  const secret = process.env.AUTH_TOKEN_SECRET || process.env.AUTH_SECRET || '';
  if (!secret) {
    throw new Error('Server misconfigured: AUTH_TOKEN_SECRET is missing');
  }
  return secret;
}
 
function signPayloadB64(payloadB64) {
  const sig = createHmac('sha256', getSecret()).update(payloadB64).digest();
  return base64UrlEncode(sig);
}
 
export function signSessionToken({ uid, email }) {
  const payload = {
    v: 1,
    type: 'session',
    uid,
    email,
    iat: Math.floor(Date.now() / 1000),
  };
  const payloadB64 = base64UrlEncode(JSON.stringify(payload));
  const sigB64 = signPayloadB64(payloadB64);
  return `${payloadB64}.${sigB64}`;
}
 
export function verifySessionToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
 
  const [payloadB64, sigB64] = parts;
  if (!payloadB64 || !sigB64) return null;
 
  const expectedSig = signPayloadB64(payloadB64);
  try {
    const a = Buffer.from(sigB64);
    const b = Buffer.from(expectedSig);
    if (a.length !== b.length) return null;
    if (!timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
 
  try {
    const payload = JSON.parse(base64UrlDecodeToString(payloadB64));
    if (!payload || payload.v !== 1 || payload.type !== 'session') return null;
    if (typeof payload.uid !== 'string' || typeof payload.email !== 'string') return null;
    return payload;
  } catch {
    return null;
  }
}
 
export function getSessionFromRequest(req) {
  const h = req.headers?.authorization || req.headers?.Authorization;
  const bearer =
    typeof h === 'string' && h.toLowerCase().startsWith('bearer ') ? h.slice(7).trim() : null;
  const token =
    bearer ||
    (typeof req.query?.session === 'string' ? req.query.session : null) ||
    (typeof req.query?.token === 'string' ? req.query.token : null);
  return verifySessionToken(token);
}
 
