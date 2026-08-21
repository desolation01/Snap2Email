// ─── Snap2Email API Proxy Server ──────────────────────────
// Proxies AI API requests so the API key never reaches the client.

import { readFileSync, existsSync } from 'fs'
import { createServer } from 'http'
import { parse } from 'url'

// Load environment from parent .env
function loadEnv() {
  const envPath = new URL('../.env', import.meta.url)
  if (!existsSync(envPath)) {
    console.warn('No .env file found at', envPath)
    return
  }
  const content = readFileSync(envPath, 'utf-8')
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    const value = trimmed.slice(eq + 1).trim()
    if (!process.env[key]) {
      process.env[key] = value
    }
  }
}

loadEnv()

const AI_API_KEY = process.env.VITE_AI_API_KEY
const AI_BASE_URL = process.env.VITE_AI_BASE_URL || 'https://openrouter.ai/api/v1'
const PORT = parseInt(process.env.PORT || '3001', 10)

if (!AI_API_KEY) {
  console.error('VITE_AI_API_KEY is not set in .env. AI proxy will not work.')
}

const server = createServer(async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  const url = parse(req.url || '/', true)
  const path = url.pathname

  // Health check
  if (path === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ ok: true, keySet: !!AI_API_KEY }))
    return
  }

  // Proxy: list models
  if (path === '/api/models' && req.method === 'GET') {
    if (!AI_API_KEY) {
      res.writeHead(400, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: { message: 'AI API key not configured on server' } }))
      return
    }

    try {
      const apiRes = await fetch(AI_BASE_URL + '/models', {
        headers: { Authorization: 'Bearer ' + AI_API_KEY },
      })
      const data = await apiRes.json()
      res.writeHead(apiRes.status, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(data))
    } catch (err) {
      res.writeHead(502, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: { message: err.message } }))
    }
    return
  }

  // Proxy: chat completions (streaming + non-streaming)
  if (path === '/api/chat/completions' && req.method === 'POST') {
    if (!AI_API_KEY) {
      res.writeHead(400, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: { message: 'AI API key not configured on server' } }))
      return
    }

    // Read request body
    const chunks = []
    for await (const chunk of req) {
      chunks.push(chunk)
    }
    const body = Buffer.concat(chunks).toString('utf-8')

    try {
      const apiRes = await fetch(AI_BASE_URL + '/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + AI_API_KEY,
          'HTTP-Referer': req.headers['origin'] || 'http://localhost:5173',
          'X-Title': 'Snap2Email',
        },
        body: body,
      })

      // Forward response (support streaming)
      const contentType = apiRes.headers.get('content-type') || 'application/json'
      const headers = { 'Content-Type': contentType }
      const transferEncoding = apiRes.headers.get('transfer-encoding')
      if (transferEncoding) {
        headers['Transfer-Encoding'] = transferEncoding
      }
      res.writeHead(apiRes.status, headers)

      if (apiRes.body) {
        const reader = apiRes.body.getReader()
        const pump = async () => {
          try {
            while (true) {
              const { done, value } = await reader.read()
              if (done) { res.end(); return }
              res.write(value)
            }
          } catch (e) {
            res.end()
          }
        }
        pump()
      } else {
        const text = await apiRes.text()
        res.end(text)
      }
    } catch (err) {
      res.writeHead(502, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: { message: err.message } }))
    }
    return
  }

  // 404
  res.writeHead(404, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ error: 'Not found' }))
})

server.listen(PORT, () => {
  console.log('Snap2Email API proxy running on http://localhost:' + PORT)
  console.log('AI API key configured: ' + !!AI_API_KEY)
})