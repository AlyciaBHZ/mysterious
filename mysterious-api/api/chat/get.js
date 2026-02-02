/**
 * Get a chat record
 * GET /api/chat/get?id=xxx
 * Authorization: Bearer <sessionToken>
 */
 
import { getSessionFromRequest } from '../_session.js';
import { hasRedis, redisCmd } from '../_upstash.js';
import { memoryChats } from '../_memoryStore.js';
import { applyCors } from '../_cors.js';
 
export default async function handler(req, res) {
  const cors = applyCors(req, res, { methods: 'GET, OPTIONS', headers: 'Content-Type, Authorization, X-Requested-With' });
  if (cors.handled) return;
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
 
  const session = getSessionFromRequest(req);
  if (!session) return res.status(401).json({ ok: false, message: '未登录' });
 
  const id = String(req.query?.id || '').trim();
  if (!id) return res.status(400).json({ ok: false, message: '缺少 id' });
 
  try {
    if (hasRedis()) {
      const raw = await redisCmd(['GET', `chat:${session.uid}:${id}`]);
      if (!raw) return res.status(404).json({ ok: false, message: '记录不存在' });
      const obj = JSON.parse(String(raw));
      return res.json({ ok: true, item: obj, storage: 'redis' });
    }
 
    const arr = memoryChats.get(session.uid) || [];
    const item = arr.find((c) => c.id === id);
    if (!item) return res.status(404).json({ ok: false, message: '记录不存在' });
    return res.json({ ok: true, item, storage: 'memory' });
  } catch (err) {
    console.error('chat get error:', err);
    return res.status(500).json({
      ok: false,
      message: err && typeof err === 'object' && 'message' in err ? String(err.message) : '服务器错误',
    });
  }
}
 
