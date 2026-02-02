/**
 * Token signing/verifying for paid users.
 *
 * Token format: base64url(payloadJSON) + "." + base64url(hmacSHA256(payloadB64))
 *
 * Payload includes:
 * - v: token version
 * - uid: user id (redis key suffix)
 * - iat: issued-at epoch seconds
 */
 
import { createHmac, timingSafeEqual } from 'node:crypto';
 
function base64UrlEncode(buf) {
  return Buffer.from(buf)
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
  const secret = process.env.USER_TOKEN_SECRET || process.env.TOKEN_SECRET || '';
  if (!secret) {
    throw new Error('Server misconfigured: USER_TOKEN_SECRET is missing');
  }
  return secret;
}
 
function signPayloadB64(payloadB64) {
  const sig = createHmac('sha256', getSecret()).update(payloadB64).digest();
  return base64UrlEncode(sig);
}
 
function getUserTokenTtlSeconds() {
  const days = Number(process.env.USER_TOKEN_TTL_DAYS || 365);
  const safeDays = Number.isFinite(days) && days > 0 ? days : 365;
  return Math.floor(safeDays * 24 * 60 * 60);
}
 
export function signUserToken({ uid }) {
  const iat = Math.floor(Date.now() / 1000);
  const payload = {
    v: 1,
    uid,
    iat,
    exp: iat + getUserTokenTtlSeconds(),
  };
  const payloadB64 = base64UrlEncode(JSON.stringify(payload));
  const sigB64 = signPayloadB64(payloadB64);
  return `${payloadB64}.${sigB64}`;
}
 
export function verifyUserToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
 
  const [payloadB64, sigB64] = parts;
  if (!payloadB64 || !sigB64) return null;
 
  const expectedSig = signPayloadB64(payloadB64);
 
  // Constant-time compare
  try {
    const a = Buffer.from(sigB64);
    const b = Buffer.from(expectedSig);
    if (a.length !== b.length) return null;
    if (!timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
 
  try {
    const payloadJson = base64UrlDecodeToString(payloadB64);
    const payload = JSON.parse(payloadJson);
    if (!payload || payload.v !== 1 || typeof payload.uid !== 'string') return null;
    if (typeof payload.exp === 'number') {
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp <= now) return null;
    }
    return payload;
  } catch {
    return null;
  }
}
 
