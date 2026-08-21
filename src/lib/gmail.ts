import { db } from './db'

// ─── Gmail API via client-side OAuth 2.0 ──────────────────────
// Uses Google Identity Services (GIS) for OAuth and the Gmail REST API.

declare const google: any

const GMAIL_SCOPE = 'https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/userinfo.email'
const ENV_GMAIL_CLIENT_ID = import.meta.env.VITE_GMAIL_CLIENT_ID || ''

let tokenClient: any = null
let accessToken: string | null = null
let gmailClientId: string = ENV_GMAIL_CLIENT_ID

export function isGmailReady(): boolean {
  return !!accessToken && !!gmailClientId
}

export function getAccessToken(): string | null {
  return accessToken
}

/** Clear the in-memory access token (called on sign-out). */
export function clearAccessToken() {
  accessToken = null
}

/**
 * Request Gmail OAuth token. Shows a popup if not yet authorized.
 */
export async function requestGmailToken(): Promise<boolean> {
  if (!gmailClientId) {
    throw new Error('Gmail Client ID not configured. Set VITE_GMAIL_CLIENT_ID in .env.')
  }

  return new Promise((resolve, reject) => {
    try {
      tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: gmailClientId,
        scope: GMAIL_SCOPE,
        callback: (resp: any) => {
          if (resp.error) {
            reject(new Error(resp.error_description || resp.error))
            return
          }
          accessToken = resp.access_token ?? null
          resolve(true)
        },
        error_callback: (err: any) => {
          if (err.type === 'popup_closed') {
            resolve(false)
          } else {
            reject(new Error(err.message || 'OAuth error'))
          }
        },
      })

      tokenClient.requestAccessToken()
    } catch (err) {
      reject(err)
    }
  })
}

/**
 * Revoke Gmail access token.
 */
export function revokeGmailToken() {
  if (accessToken) {
    google.accounts.oauth2.revoke(accessToken, () => {
      accessToken = null
    })
  }
}

/**
 * Convert a string to base64 (standard, with padding).
 * Uses TextEncoder for correct UTF-8 handling.
 */
function toBase64(str: string): string {
  const bytes = new TextEncoder().encode(str)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

/**
 * Convert a string to base64url (URL-safe base64 without padding).
 */
function toBase64Url(str: string): string {
  return toBase64(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

/**
 * Chunk base64 data into 76-char lines for MIME body.
 */
function chunkBase64(data: string): string {
  const lines: string[] = []
  for (let i = 0; i < data.length; i += 76) {
    lines.push(data.slice(i, i + 76))
  }
  return lines.join('\r\n')
}

/**
 * Encode a string for use in a MIME header (RFC 2047).
 * Pure ASCII is returned as-is; non-ASCII gets =?UTF-8?B?...?= encoding.
 * Also strips CR, LF, and null characters to prevent header injection.
 */
function sanitizeHeader(text: string): string {
  // Strip CR, LF, null — prevents header injection
  return text.replace(/[\r\n\x00]/g, ' ').trim()
}

function encodeMimeHeader(text: string): string {
  text = sanitizeHeader(text)
  // Check if the string contains only ASCII characters
  for (let i = 0; i < text.length; i++) {
    if (text.charCodeAt(i) > 127) {
      // Contains non-ASCII — encode as RFC 2047
      const base64 = toBase64(text)
      // RFC 2047 says encoded-words should not exceed 75 chars total.
      // The encoded-word wrapper =?UTF-8?B?...?= is 14 chars, so we have ~61 chars for base64.
      if (base64.length <= 61) {
        return `=?UTF-8?B?${base64}?=`
      }
      // Split long base64 into multiple encoded-words
      const result: string[] = []
      for (let i = 0; i < base64.length; i += 60) {
        result.push(`=?UTF-8?B?${base64.slice(i, i + 60)}?=`)
      }
      return result.join('\r\n ')
    }
  }
  // Pure ASCII — return as-is
  return text
}

/**
 * Send an email via the Gmail API, optionally with a file attachment.
 */
export async function sendEmailViaGmail(
  to: string,
  subject: string,
  bodyHtml: string,
  bodyText: string,
  senderName: string,
  senderEmail: string,
  attachment?: { filename: string; data: string; mimeType: string },
  signal?: AbortSignal,
): Promise<{ messageId: string }> {
  if (!accessToken) {
    throw new Error('Not authenticated with Gmail. Please sign in.')
  }

  // ── Build the MIME message ──
  // We build it as a raw string with explicit \r\n line endings

  const boundary = `BOUNDARY_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
  const altBoundary = `ALT_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
  const nl = '\r\n'

  let message = ''

  // Headers — sanitize to prevent header injection
  message += `MIME-Version: 1.0${nl}`
  message += `From: ${encodeMimeHeader(senderName)} <${sanitizeHeader(senderEmail)}>${nl}`
  message += `To: ${sanitizeHeader(to)}${nl}`
  message += `Subject: ${encodeMimeHeader(subject)}${nl}`
  message += `Content-Type: multipart/mixed; boundary="${boundary}"${nl}`
  message += `${nl}`

  // ── Alternative part (text + html) ──
  message += `--${boundary}${nl}`
  message += `Content-Type: multipart/alternative; boundary="${altBoundary}"${nl}`
  message += `${nl}`

  // Text part
  message += `--${altBoundary}${nl}`
  message += `Content-Type: text/plain; charset="UTF-8"${nl}`
  message += `Content-Transfer-Encoding: base64${nl}`
  message += `${nl}`
  message += chunkBase64(toBase64(bodyText)) + `${nl}`
  message += `${nl}`

  // HTML part
  message += `--${altBoundary}${nl}`
  message += `Content-Type: text/html; charset="UTF-8"${nl}`
  message += `Content-Transfer-Encoding: base64${nl}`
  message += `${nl}`
  message += chunkBase64(toBase64(bodyHtml)) + `${nl}`
  message += `${nl}`

  // Close alternative
  message += `--${altBoundary}--${nl}`

  // ── Attachment (if any) ──
  if (attachment) {
    message += `${nl}`
    message += `--${boundary}${nl}`
    message += `Content-Type: ${attachment.mimeType}; name="${encodeMimeHeader(attachment.filename)}"${nl}`
    message += `Content-Transfer-Encoding: base64${nl}`
    message += `Content-Disposition: attachment; filename="${encodeMimeHeader(attachment.filename)}"${nl}`
    message += `${nl}`
    message += chunkBase64(attachment.data) + `${nl}`
    message += `${nl}`
  }

  // Close mixed
  message += `--${boundary}--`

  // ── Encode the full message as base64url ──
  const encodedMessage = toBase64Url(message)

  // ── Send via Gmail API ──
  const response = await fetch(
    'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw: encodedMessage }),
      signal,
    },
  )

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Gmail API error: ${response.status} — ${err}`)
  }

  const data = await response.json()

  // Audit log
  try {
    await db.sendLogs.put({
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      timestamp: Date.now(),
      recipient: to,
      subject: subject,
      status: 'sent',
    })
  } catch { /* log best-effort */ }

  return { messageId: data.id }
}

/**
 * Get the user's Gmail email address from the access token.
 */
export async function getGmailProfile(): Promise<{ email: string; name: string }> {
  if (!accessToken) {
    throw new Error('Not authenticated with Gmail.')
  }
  const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!response.ok) {
    throw new Error(`Failed to get profile: ${response.status}`)
  }
  return response.json()
}

/**
 * Check if Google Identity Services is loaded.
 */
export function isGisLoaded(): boolean {
  return typeof google !== 'undefined' && !!google.accounts
}