/**
 * Password hashing with Node crypto.scrypt (no deps).
 *
 * Stored format:
 *   scrypt$N$r$p$saltB64$hashB64
 */
 
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
 
const DEFAULT_N = 16384;
const DEFAULT_r = 8;
const DEFAULT_p = 1;
const KEYLEN = 32;
 
export function hashPassword(password) {
  const pw = String(password || '');
  if (pw.length < 6) {
    throw new Error('密码至少 6 位');
  }
  const salt = randomBytes(16);
  const key = scryptSync(pw, salt, KEYLEN, { N: DEFAULT_N, r: DEFAULT_r, p: DEFAULT_p });
  return `scrypt$${DEFAULT_N}$${DEFAULT_r}$${DEFAULT_p}$${salt.toString('base64')}$${Buffer.from(key).toString('base64')}`;
}
 
export function verifyPassword(password, stored) {
  try {
    const pw = String(password || '');
    const s = String(stored || '');
    const parts = s.split('$');
    if (parts.length !== 6) return false;
    if (parts[0] !== 'scrypt') return false;
    const N = Number(parts[1]);
    const r = Number(parts[2]);
    const p = Number(parts[3]);
    const salt = Buffer.from(parts[4], 'base64');
    const hash = Buffer.from(parts[5], 'base64');
    const key = scryptSync(pw, salt, hash.length, { N, r, p });
    return timingSafeEqual(Buffer.from(key), hash);
  } catch {
    return false;
  }
}
 
