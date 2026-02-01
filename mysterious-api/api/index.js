/**
 * API root - convenience endpoint
 *
 * Vercel routing:
 * - /api/index.js -> /api
 *
 * This avoids relying on vercel.json rewrites (which may not apply if the project root is misconfigured).
 */
export default function handler(req, res) {
  // CORS headers (match other endpoints)
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

