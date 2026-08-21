// ─── Vercel Serverless: /api/health ────────────────────────────
// Health check endpoint. Returns whether the AI API key is configured.

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }

  const keySet = !!process.env.VITE_AI_API_KEY
  res.status(200).json({ ok: true, keySet })
}