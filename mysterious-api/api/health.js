/**
 * 健康检查接口
 */
export default function handler(req, res) {
  // CORS headers
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'mysterious-api',
    version: '1.0.0',
    gemini: {
      model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
      hasKey: Boolean(process.env.GEMINI_API_KEY),
      fallbackModels: (process.env.GEMINI_FALLBACK_MODELS ||
        'gemini-2.5-flash,gemini-3-flash,gemini-2.5-flash-lite'),
    },
  });
}

