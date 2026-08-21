// ─── Vercel Serverless: /api/chat/completions ─────────────────
// Proxies chat completion requests to the AI provider.
// Supports both streaming and non-streaming modes.

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: { message: 'Method not allowed' } })
    return
  }

  const apiKey = process.env.VITE_AI_API_KEY
  const baseUrl = process.env.VITE_AI_BASE_URL || 'https://openrouter.ai/api/v1'

  if (!apiKey) {
    res.status(503).json({ error: { message: 'AI API key not configured on server' } })
    return
  }

  // Read request body
  const chunks = []
  for await (const chunk of req) {
    chunks.push(chunk)
  }
  const body = Buffer.concat(chunks).toString('utf-8')

  try {
    // Determine if this is a streaming request
    const parsed = JSON.parse(body)
    const isStream = parsed.stream === true

    const apiRes = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': req.headers['origin'] || 'https://tristan-namingit.vercel.app',
        'X-Title': 'Snap2Email',
      },
      body,
    })

    // Forward response headers
    const contentType = apiRes.headers.get('content-type') || 'application/json'
    const responseHeaders = { 'Content-Type': contentType }

    if (isStream) {
      responseHeaders['Cache-Control'] = 'no-cache'
      responseHeaders['Connection'] = 'keep-alive'
    }

    res.writeHead(apiRes.status, responseHeaders)

    if (apiRes.body) {
      // Stream the response body to the client
      const reader = apiRes.body.getReader()
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) { res.end(); return }
          res.write(value)
        }
      } catch (e) {
        res.end()
      }
    } else {
      const text = await apiRes.text()
      res.end(text)
    }
  } catch (err) {
    res.writeHead(502, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: { message: err.message } }))
  }
}