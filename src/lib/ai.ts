// ─── AI Template Generation via Backend Proxy ────────────────
// All AI API calls go through the /api/ proxy so the API key
// stays on the server and never reaches the client bundle.

const API_BASE = '/api'

// Model routing — use a cheap vision model for text extraction,
// and a more capable model for reasoning / email writing.
const VISION_MODEL = import.meta.env.VITE_AI_VISION_MODEL || 'openai/gpt-4o-mini'
export const REASONING_MODEL = import.meta.env.VITE_AI_REASONING_MODEL || 'openai/gpt-4o'

export interface AiGenerateParams {
  jobRole: string
  jobDescription: string
  tone?: 'professional' | 'friendly' | 'formal' | 'casual'
  length?: 'short' | 'medium' | 'long'
  language?: string
}

export interface AiGenerateResult {
  subject: string
  bodyHtml: string
  bodyText: string
  variables: string[]
}

/**
 * Stage 1: Extract text from a job posting screenshot.
 * Uses the cheaper vision model.
 */
export async function visionExtract(
  imageDataUrl: string,
): Promise<string> {
  const response = await fetch(`${API_BASE}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: VISION_MODEL,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Extract all text from this job posting image. List every job title, qualification, requirement, email address, and company name you can find. Be thorough — return everything as raw text.' },
            { type: 'image_url', image_url: { url: imageDataUrl } },
          ],
        },
      ],
      temperature: 0.1,
      max_tokens: 2000,
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Vision API error: ${response.status} — ${err}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error('Vision model returned empty response')

  return content
}

/**
 * Send a chat message to the AI, optionally specifying a model.
 */
async function chatCompletion(
  messages: {
    role: 'user' | 'assistant' | 'system'
    content: string | { type: 'text' | 'image_url'; text?: string; image_url?: { url: string } }[]
  }[],
  model: string = REASONING_MODEL,
  signal?: AbortSignal,
): Promise<string> {
  const response = await fetch(`${API_BASE}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 4000,
    }),
    signal,
  })

  if (!response.ok) {
    const err = await response.json()
    throw new Error(err?.error?.message || `AI API error: ${response.status}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error('AI returned empty response')

  return content
}

/**
 * Stream a chat message from the AI, optionally specifying a model.
 */
async function streamChatCompletion(
  messages: {
    role: 'user' | 'assistant' | 'system'
    content: string | { type: 'text' | 'image_url'; text?: string; image_url?: { url: string } }[]
  }[],
  callbacks: {
    onToken: (text: string) => void
    onDone: (fullText: string) => void
    onError: (error: Error) => void
  },
  model: string = REASONING_MODEL,
  signal?: AbortSignal,
): Promise<void> {
  const response = await fetch(`${API_BASE}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 4000,
      stream: true,
    }),
    signal,
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: { message: `HTTP ${response.status}` } }))
    throw new Error(err?.error?.message || `AI API error: ${response.status}`)
  }

  const reader = response.body?.getReader()
  if (!reader) throw new Error('Response body is not readable')

  const decoder = new TextDecoder()
  let fullText = ''
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || !trimmed.startsWith('data: ')) continue
        const data = trimmed.slice(6)
        if (data === '[DONE]') continue

        try {
          const parsed = JSON.parse(data)
          const delta = parsed.choices?.[0]?.delta?.content
          if (delta) {
            fullText += delta
            callbacks.onToken(delta)
          }
        } catch { /* skip malformed */ }
      }
    }

    if (buffer.trim().startsWith('data: ')) {
      const data = buffer.trim().slice(6)
      if (data !== '[DONE]') {
        try {
          const parsed = JSON.parse(data)
          const delta = parsed.choices?.[0]?.delta?.content
          if (delta) {
            fullText += delta
            callbacks.onToken(delta)
          }
        } catch { /* skip */ }
      }
    }

    callbacks.onDone(fullText)
  } catch (err) {
    if (signal?.aborted) {
      callbacks.onDone(fullText)
      return
    }
    callbacks.onError(err instanceof Error ? err : new Error('Stream error'))
  }
}

// ─── Re-export for backward compatibility ───────────────────
// These keep the same signatures as before but use REASONING_MODEL by default.

export async function sendChatMessage(
  messages: Parameters<typeof chatCompletion>[0],
  signal?: AbortSignal,
): Promise<string> {
  return chatCompletion(messages, REASONING_MODEL, signal)
}

export async function streamChatMessage(
  messages: Parameters<typeof streamChatCompletion>[0],
  callbacks: Parameters<typeof streamChatCompletion>[1],
  signal?: AbortSignal,
): Promise<void> {
  return streamChatCompletion(messages, callbacks, REASONING_MODEL, signal)
}

export { chatCompletion, streamChatCompletion }

/**
 * Test the AI connection via the proxy.
 */
export async function testAiConnection(): Promise<{ ok: boolean; message: string }> {
  try {
    const healthRes = await fetch(`${API_BASE}/health`)
    if (!healthRes.ok) {
      return { ok: false, message: `Proxy unreachable (${healthRes.status}). Make sure the API server is running (npm run dev starts both).` }
    }
    const health = await healthRes.json()
    if (!health.keySet) {
      return { ok: false, message: 'AI API key not configured on server' }
    }

    const response = await fetch(`${API_BASE}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: REASONING_MODEL,
        messages: [
          { role: 'system', content: 'Reply with a single word.' },
          { role: 'user', content: 'Hi' },
        ],
        max_tokens: 5,
      }),
    })

    if (!response.ok) {
      const err = await response.json()
      const msg = err?.error?.message || `HTTP ${response.status}`
      return { ok: false, message: msg }
    }

    return { ok: true, message: 'Connected successfully' }
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : 'Network error' }
  }
}