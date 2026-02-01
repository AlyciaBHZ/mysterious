/**
 * List chat history for logged-in user
 * GET /api/chat/list?limit=20
 * Authorization: Bearer <sessionToken>
 */
 
import { getSessionFromRequest } from '../_session.js';
import { hasRedis, redisCmd } from '../_upstash.js';
import { memoryChats } from '../_memoryStore.js';
 
function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Max-Age', '86400');
}
 
export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
 
  const session = getSessionFromRequest(req);
  if (!session) return res.status(401).json({ ok: false, message: '未登录' });
 
  const limit = Math.min(50, Math.max(1, Number(req.query?.limit || 20)));
 
  try {
    if (hasRedis()) {
      const listKey = `chat:list:${session.uid}`;
      const ids = await redisCmd(['LRANGE', listKey, '0', String(limit - 1)]);
      const idList = Array.isArray(ids) ? ids.filter(Boolean) : [];
 
      // Fetch each chat JSON
      const items = [];
      for (const id of idList) {
        const raw = await redisCmd(['GET', `chat:${session.uid}:${id}`]);
        if (!raw) continue;
        try {
          const obj = JSON.parse(String(raw));
          items.push({
            id: obj.id,
            createdAt: obj.createdAt,
            title: obj.title,
            question: obj.question,
          });
        } catch {
          // ignore bad record
        }
      }
 
      return res.json({ ok: true, items, storage: 'redis' });
    }
 
    const arr = memoryChats.get(session.uid) || [];
    const items = arr.slice(0, limit).map((c) => ({
      id: c.id,
      createdAt: c.createdAt,
      title: c.title,
      question: c.question,
    }));
    return res.json({ ok: true, items, storage: 'memory' });
  } catch (err) {
    console.error('chat list error:', err);
    return res.status(500).json({
      ok: false,
      message: err && typeof err === 'object' && 'message' in err ? String(err.message) : '服务器错误',
    });
  }
}
 
