import { useCallback, useEffect, useRef, useState } from 'react'
import { getSettings } from '../lib/db'
import { streamChatCompletion, REASONING_MODEL, visionExtract } from '../lib/ai'
import { requestGmailToken, revokeGmailToken, sendEmailViaGmail, getGmailProfile, isGmailReady, clearAccessToken } from '../lib/gmail'
import type { AppSettings, ScanResult } from '../lib/types'

declare const google: any

type Phase = 'idle' | 'scanning' | 'sending' | 'done' | 'error'

// ─── SVG Icons (no emojis) ──────────────────────────────────

function IconScan() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="9" y1="3" x2="9" y2="21" />
      <line x1="15" y1="3" x2="15" y2="21" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="3" y1="15" x2="21" y2="15" />
    </svg>
  )
}

function IconGmail() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M2 4l10 8 10-8" />
    </svg>
  )
}

function IconCheck() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  )
}

function IconX() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function IconCopy() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  )
}

function IconMail() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M2 4l10 8 10-8" />
    </svg>
  )
}

function IconPerson() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function IconSpinner() {
  return (
    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M12 2a10 10 0 0110 10M12 2a10 10 0 00-10 10" opacity="0.3" />
    </svg>
  )
}

function IconLock() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  )
}

// ─── Paperclip Icon (small) ──────────────────────────────────
function PaperclipIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
    </svg>
  )
}

// ─── Paperclip Mascot ───────────────────────────────────────
function PaperclipMascot({ size = 80 }: { size?: number }) {
  return (
    <svg className="mascot-wiggle mascot-float" width={size} height={size} viewBox="0 0 80 100" fill="none">
      {/* Paperclip body — two loops */}
      <path d="M25 90c-8 0-14-6-14-14V28c0-8 6-14 14-14s14 6 14 14v44c0 5-4 9-9 9s-9-4-9-9V32"
        stroke="var(--border-strong)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M25 90c-8 0-14-6-14-14V28c0-8 6-14 14-14s14 6 14 14v44c0 5-4 9-9 9s-9-4-9-9V32"
        stroke="var(--ink-faint)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
      {/* Eyes */}
      <circle cx="27" cy="38" r="2.5" fill="var(--ink)" />
      <circle cx="41" cy="38" r="2.5" fill="var(--ink)" />
      {/* Eye highlights */}
      <circle cx="28" cy="37" r="1" fill="white" />
      <circle cx="42" cy="37" r="1" fill="white" />
      {/* Smile */}
      <path d="M29 45c2 2.5 6 2.5 8 0" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" />
      {/* Blush marks */}
      <ellipse cx="22" cy="44" rx="3" ry="1.5" fill="var(--stamp-light)" opacity="0.6" />
      <ellipse cx="46" cy="44" rx="3" ry="1.5" fill="var(--stamp-light)" opacity="0.6" />
    </svg>
  )
}

// ─── Date Stamp ─────────────────────────────────────────────
function DateStamp() {
  const now = new Date()
  const month = now.toLocaleString('en', { month: 'short' }).toUpperCase()
  const day = now.getDate()
  const year = now.getFullYear()
  return (
    <div className="date-stamp">
      <span>RECEIVED</span>
      <span>{month} {day}, {year}</span>
    </div>
  )
}

function IconFacebook() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  )
}

function IconEmail() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M2 4l10 8 10-8" />
    </svg>
  )
}

// ─── Component ──────────────────────────────────────────────

export default function Home() {
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [droppedImage, setDroppedImage] = useState<string | null>(null)
  const [droppedFileName, setDroppedFileName] = useState<string>('')
  const [phase, setPhase] = useState<Phase>('idle')
  const [result, setResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState('')
  const [streamingText, setStreamingText] = useState('')
  const [copied, setCopied] = useState(false)
  const [gmailConnected, setGmailConnected] = useState(false)
  const [gmailEmail, setGmailEmail] = useState('')
  const [gmailSigningIn, setGmailSigningIn] = useState(false)
  const [gmailError, setGmailError] = useState('')
  const [gmailAccessDenied, setGmailAccessDenied] = useState(false)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [sendMsg, setSendMsg] = useState<{ type: 'sent' | 'skipped' | 'error'; text: string } | null>(null)
  const [mode, setMode] = useState<'auto' | 'review'>('auto')
  const [editRecipient, setEditRecipient] = useState('')
  const [editSubject, setEditSubject] = useState('')
  const [editBody, setEditBody] = useState('')
  const [aiConfigured, setAiConfigured] = useState(false)
  const [validationModal, setValidationModal] = useState<{ title: string; message: string } | null>(null)
  const [selectedJobTitle, setSelectedJobTitle] = useState<string | null>(null)
  const [regeneratingEmail, setRegeneratingEmail] = useState(false)
  const [cachedExtractedText, setCachedExtractedText] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropRef = useRef<HTMLDivElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    getSettings()
      .then(s => setSettings(s))
      .catch(() => setValidationModal({ title: 'Storage Error', message: 'Could not load settings. Your browser may not support local storage in this mode.' }))
    // Check if already signed into Gmail from a previous session
    if (isGmailReady()) {
      setGmailConnected(true)
      getGmailProfile().then(p => setGmailEmail(p.email)).catch(() => {})
    }
  }, [])

  // Abort in-flight requests on unmount
  useEffect(() => {
    return () => abortRef.current?.abort()
  }, [])

  // Check if AI API key is configured on the server
  useEffect(() => {
    fetch('/api/health')
      .then(r => r.json())
      .then(d => setAiConfigured(!!d.keySet))
      .catch(() => setAiConfigured(false))
  }, [])

  async function handleGmailSignIn() {
    setGmailSigningIn(true)
    setGmailError('')
    setGmailAccessDenied(false)
    try {
      if (typeof google === 'undefined' || !google.accounts) {
        throw new Error('Google Identity Services is still loading. Please wait a moment and try again.')
      }
      const ok = await requestGmailToken()
      if (ok) {
        const profile = await getGmailProfile()
        setGmailEmail(profile.email)
        setGmailConnected(true)
      } else {
        setGmailAccessDenied(true)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gmail sign-in failed'
      setGmailError(msg)
      setGmailAccessDenied(true)
    } finally {
      setGmailSigningIn(false)
    }
  }

  const loadImage = useCallback(async (file: File) => {
    // Validate file type: only JPEG and PNG
    const validTypes = ['image/jpeg', 'image/png']
    if (!validTypes.includes(file.type)) {
      setValidationModal({ title: 'Invalid File Type', message: 'Only JPEG and PNG images are accepted.' })
      return
    }
    // Magic-byte verification (defense against MIME spoofing)
    try {
      const header = await file.slice(0, 4).arrayBuffer()
      const view = new Uint8Array(header)
      const isJPEG = view[0] === 0xFF && view[1] === 0xD8
      const isPNG = view[0] === 0x89 && view[1] === 0x50 && view[2] === 0x4E && view[3] === 0x47
      if (!isJPEG && !isPNG) {
        setValidationModal({ title: 'Invalid File', message: 'The file content does not match a valid JPEG or PNG image.' })
        return
      }
    } catch {
      setValidationModal({ title: 'Read Error', message: 'Could not read the file. Please try again.' })
      return
    }
    // Validate file size: max 10MB
    const MAX_SIZE = 10 * 1024 * 1024 // 10MB
    if (file.size > MAX_SIZE) {
      setValidationModal({ title: 'File Too Large', message: 'Image must be under 10MB.' })
      return
    }
    setError('')
    setDroppedFileName(file.name)
    setResult(null)
    setStreamingText('')
    setSendMsg(null)
    setPhase('idle')
    const reader = new FileReader()
    reader.onload = () => setDroppedImage(reader.result as string)
    reader.readAsDataURL(file)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) loadImage(file)
  }, [loadImage])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => setDragOver(false), [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) loadImage(file)
  }, [loadImage])

  // ── Paste handler ──
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData.items
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault()
        const file = item.getAsFile()
        if (file) loadImage(file)
        break
      }
    }
  }, [loadImage])

  async function handleScan(scanMode: 'auto' | 'review') {
    if (!droppedImage || !settings) {
      if (!settings) setValidationModal({ title: 'Settings Loading', message: 'Please wait for settings to load before scanning.' })
      return
    }

    // In auto mode, check Gmail connection first to avoid wasting AI credits
    if (scanMode === 'auto' && !gmailConnected) {
      setSendMsg({ type: 'skipped', text: 'Sign in with Gmail first to auto-send the email.' })
      setPhase('done')
      return
    }

    setPhase('scanning')
    setError('')
    setResult(null)
    setStreamingText('')

    // Create abort controller for this scan
    abortRef.current = new AbortController()
    const signal = abortRef.current.signal

    try {
      // Stage 1: Extract text from image using cheap vision model
      const extractedText = await visionExtract(droppedImage)
      setCachedExtractedText(extractedText)

      // Stage 2: Send extracted text + resume to reasoning model
      const resumeSection = settings.resumeMarkdown
        ? `\n\n---\nTHE USER'S RESUME:\n${settings.resumeMarkdown}`
        : '\n\n---\nNOTE: No resume has been uploaded yet.'

      const systemPrompt = `You are an expert job application assistant. Your task is to analyze a job posting and generate a tailored outreach email.

CRITICAL RULE — Follow the writing style instructions below exactly. They override everything else.
You MUST follow these writing style instructions:
${settings.aiInstructions ? settings.aiInstructions.slice(0, 1500) : '(none provided)'}

The user's portfolio URL is: ${settings.portfolioUrl || '(not provided — omit from signature)'}

Use this portfolio URL in the email signature when one is provided. If none is provided, omit the portfolio line from the signature entirely.

You must return the result as valid JSON. Do ALL of the following:

1. Identify the recipient's email address and name from the extracted job posting text.
2. List all job positions found, their qualifications, a matchScore (0-100), and short matchReasons.
3. Select the best matching position based on the resume.
4. Generate a complete outreach email (subject + body) tailored to the best match.

The JSON output format below is MANDATORY — the app will crash if you don't return valid JSON. Follow the writing style instructions above for the email content, subject line, and signature, but return ONLY this JSON structure, nothing else:

{
  "recipientEmail": "email or empty string",
  "recipientName": "name or 'Hiring Manager'",
  "jobPositions": [
    { "title": "...", "qualifications": ["..."], "matchScore": 85, "matchReasons": ["...", "..."] }
  ],
  "bestMatch": { "title": "...", "qualifications": ["..."], "matchScore": 92, "matchReasons": ["..."] },
  "outreachEmail": {
    "subject": "Subject line (3-7 words, under 50 chars)",
    "body": "Full email body with signature"
  }
}

The outreachEmail.body should include the full email with signature (Best regards, name, etc.) as specified in the instructions. Do NOT output the instructions' text format — only this JSON.`

      const userContent = `Here is the extracted text from the job posting screenshot:\n\n${extractedText}\n${resumeSection}`

      const fullResponse = await new Promise<string>((resolve, reject) => {
        streamChatCompletion(
          [{ role: 'system', content: systemPrompt }, { role: 'user', content: userContent }],
          {
            onToken: (token) => setStreamingText((prev) => prev + token),
            onDone: (fullText) => resolve(fullText),
            onError: (err) => reject(err),
          },
          REASONING_MODEL,
          signal,
        )
      })

      const jsonStr = fullResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
      const parsed = JSON.parse(jsonStr) as ScanResult

      if (!parsed.outreachEmail?.subject || !parsed.outreachEmail?.body) {
        throw new Error('AI response missing required email fields')
      }

      setResult(parsed)
      setSelectedJobTitle(parsed.bestMatch?.title || null)
      setMode(scanMode)

      // If review mode, fill editable fields and stop
      if (scanMode === 'review') {
        setEditRecipient(parsed.recipientEmail || '')
        setEditSubject(parsed.outreachEmail.subject)
        setEditBody(parsed.outreachEmail.body)
        setPhase('done')
        return
      }

      setPhase('sending')

      if (!parsed.recipientEmail) {
        setSendMsg({ type: 'skipped', text: 'No recipient email found in the job posting. Email was not sent.' })
        setPhase('done')
        return
      }

      const htmlBody = parsed.outreachEmail.body.replace(/\n/g, '<br>\n')

      const attachment = settings.resumeFileData && settings.resumeFileName
        ? { filename: settings.resumeFileName, data: settings.resumeFileData, mimeType: settings.resumeFileMime || 'application/octet-stream' }
        : undefined

      await sendEmailViaGmail(
        parsed.recipientEmail,
        parsed.outreachEmail.subject,
        htmlBody,
        parsed.outreachEmail.body,
        settings.senderName || gmailEmail || 'Applicant',
        settings.senderEmail || gmailEmail || '',
        attachment,
      )

      setSendMsg({ type: 'sent', text: `Email sent to ${parsed.recipientEmail}` })
      setPhase('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setStreamingText('')
      setPhase('error')
    }
  }

  async function handleCopy() {
    if (!result) return
    const recipient = mode === 'review' ? editRecipient : result.recipientEmail
    const subject = mode === 'review' ? editSubject : result.outreachEmail.subject
    const body = mode === 'review' ? editBody : result.outreachEmail.body
    const text = `To: ${recipient}\nSubject: ${subject}\n\n${body}`
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard API not available
      setCopied(false)
    }
  }

  async function handleSendReview() {
    if (!result || !settings || !editRecipient) return

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(editRecipient)) {
      setSendMsg({ type: 'error', text: 'Please enter a valid email address.' })
      return
    }

    setSendingEmail(true)
    setSendMsg(null)

    // Create abort controller for this send
    abortRef.current = new AbortController()
    const signal = abortRef.current.signal

    try {
      if (!gmailConnected) {
        // Trigger Gmail sign-in first
        if (typeof google === 'undefined' || !google.accounts) {
          throw new Error('Google Identity Services is still loading.')
        }
        const ok = await requestGmailToken()
        if (!ok) {
          setSendingEmail(false)
          setSendMsg({ type: 'error', text: 'Gmail authorization was cancelled.' })
          return
        }
        const profile = await getGmailProfile()
        setGmailEmail(profile.email)
        setGmailConnected(true)
      }

      const htmlBody = editBody.replace(/\n/g, '<br>\n')

      const attachment = settings.resumeFileData && settings.resumeFileName
        ? { filename: settings.resumeFileName, data: settings.resumeFileData, mimeType: settings.resumeFileMime || 'application/octet-stream' }
        : undefined

      await sendEmailViaGmail(
        editRecipient,
        editSubject,
        htmlBody,
        editBody,
        settings.senderName || gmailEmail || 'Applicant',
        settings.senderEmail || gmailEmail || '',
        attachment,
        signal,
      )

      setSendMsg({ type: 'sent', text: `Email sent to ${editRecipient}` })
    } catch (err) {
      setSendMsg({ type: 'error', text: err instanceof Error ? err.message : 'Failed to send email' })
    } finally {
      setSendingEmail(false)
    }
  }

  async function handleSelectPosition(jobTitle: string) {
    if (!result || !settings || !cachedExtractedText || regeneratingEmail) return
    if (jobTitle === selectedJobTitle) return

    setSelectedJobTitle(jobTitle)
    setRegeneratingEmail(true)
    setError('')

    abortRef.current = new AbortController()
    const signal = abortRef.current.signal

    try {
      const resumeSection = settings.resumeMarkdown
        ? `\n\n---\nTHE USER'S RESUME:\n${settings.resumeMarkdown}`
        : '\n\n---\nNOTE: No resume has been uploaded yet.'

      const systemPrompt = `You are an expert job application assistant. Generate a tailored outreach email for the SPECIFIC job role listed below.

CRITICAL RULE — Follow the writing style instructions below exactly. They override everything else.
You MUST follow these writing style instructions:
${settings.aiInstructions ? settings.aiInstructions.slice(0, 1500) : '(none provided)'}

The user's portfolio URL is: ${settings.portfolioUrl || '(not provided — omit from signature)'}

Use this portfolio URL in the email signature when one is provided. If none is provided, omit the portfolio line from the signature entirely.

Return ONLY this JSON — no other text:

{
  "subject": "Subject line (3-7 words, under 50 chars)",
  "body": "Full email body with signature"
}

The subject should be tailored to the specific role. The body must include the full email with signature.`

      const userContent = `The target job role is: ${jobTitle}

Here is the extracted text from the job posting screenshot:\n\n${cachedExtractedText}${resumeSection}

Generate a personalized outreach email specifically for the "${jobTitle}" role.`

      const fullResponse = await new Promise<string>((resolve, reject) => {
        streamChatCompletion(
          [{ role: 'system', content: systemPrompt }, { role: 'user', content: userContent }],
          {
            onToken: () => {},
            onDone: (fullText) => resolve(fullText),
            onError: (err) => reject(err),
          },
          REASONING_MODEL,
          signal,
        )
      })

      const jsonStr = fullResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
      const email = JSON.parse(jsonStr)

      if (!email.subject || !email.body) {
        throw new Error('AI response missing required email fields')
      }

      setResult(prev => prev ? {
        ...prev,
        bestMatch: prev.jobPositions.find(jp => jp.title === jobTitle) || prev.bestMatch,
        outreachEmail: { subject: email.subject, body: email.body },
      } : prev)

      // If in review mode, update the editable fields
      if (mode === 'review') {
        setEditSubject(email.subject)
        setEditBody(email.body)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate email for this role')
    } finally {
      setRegeneratingEmail(false)
    }
  }

  function handleReset() {
    abortRef.current?.abort()
    abortRef.current = null
    setDroppedImage(null)
    setDroppedFileName('')
    setResult(null)
    setStreamingText('')
    setSendMsg(null)
    setPhase('idle')
    setError('')
    setMode('auto')
    setEditRecipient('')
    setEditSubject('')
    setEditBody('')
  }

  const hasResume = settings?.resumeMarkdown ? true : false

  return (
    <div className="max-w-3xl mx-auto space-y-6" onPaste={handlePaste}>
      {/* Header */}
      <div>
        <h1 className="font-[var(--display)] text-2xl text-[var(--ink)] leading-tight">Job Scan</h1>
        <p className="text-sm text-[var(--ink-muted)] mt-1 leading-relaxed">
          Drop a job posting screenshot. I will scan it, match your resume, write a tailored email, and send it.
        </p>
      </div>

      {/* Gmail sign-in card */}
      {gmailAccessDenied ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
          <div className="relative bg-[var(--surface)] border border-[var(--border)] shadow-xl rounded-sm p-8 max-w-sm w-full mx-4 text-center">
            <div className="flex justify-center mb-4 text-[var(--ink-muted)]">
              <IconLock />
            </div>
            <h2 className="font-[var(--display)] text-xl text-[var(--ink)]">Want to get access?</h2>
            <p className="text-sm text-[var(--ink-muted)] mt-2 mb-6">
              Directly contact me on Facebook or Email
            </p>
            <div className="space-y-3">
              <a
                href="https://web.facebook.com/profile.php?id=61581862737689"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-[var(--navy)] text-white text-sm font-medium rounded-sm hover:bg-[#162d4a] transition-colors"
              >
                <IconFacebook />
                Message on Facebook
              </a>
              <div className="flex items-center justify-center gap-2 w-full py-2.5 bg-[var(--paper)] text-[var(--ink-muted)] text-sm font-mono rounded-sm border border-[var(--border)]">
                <IconEmail />
                <span>tristan.namingit@gmail.com</span>
              </div>
            </div>
            {gmailError && (
              <p className="text-xs text-[var(--stamp)] mt-4">{gmailError}</p>
            )}
            <button
              onClick={() => setGmailAccessDenied(false)}
              className="btn-ghost text-xs mt-4"
            >
              Try signing in again
            </button>
          </div>
        </div>
      ) : (
        <div className={`file-card p-4 flex items-center justify-between tape ${gmailConnected ? 'bg-[var(--leaf-light)] border-[var(--leaf)]' : ''}`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-sm flex items-center justify-center ${gmailConnected ? 'bg-[var(--leaf)] text-white' : 'bg-[var(--paper)] text-[var(--ink-muted)]'}`}>
              <IconGmail />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--ink)]">
                {gmailConnected ? 'Connected to Gmail' : 'Connect your Gmail'}
              </p>
              {gmailConnected ? (
                <p className="text-xs font-mono text-[var(--leaf)]">{gmailEmail}</p>
              ) : (
                <p className="text-xs text-[var(--ink-muted)]">Emails sent automatically after scanning</p>
              )}
            </div>
          </div>
          {!gmailConnected && (
            <button
              onClick={handleGmailSignIn}
              disabled={gmailSigningIn}
              className="btn btn-secondary text-xs"
            >
              {gmailSigningIn ? (
                <><IconSpinner /> Signing in...</>
              ) : (
                <><IconGmail /> Sign in</>
              )}
            </button>
          )}
          {gmailConnected && (
            <button
              onClick={() => {
                revokeGmailToken()
                clearAccessToken()
                setGmailConnected(false)
                setGmailEmail('')
              }}
              className="btn-ghost text-xs flex items-center gap-1"
              style={{ color: 'var(--stamp)' }}
            >
              <IconX /> Disconnect
            </button>
          )}
        </div>
      )}

      {/* Status stamps */}
      <div className="flex flex-wrap gap-2">
        <span className={`stamp ${aiConfigured ? 'stamp-green' : 'stamp-red'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${aiConfigured ? 'bg-[var(--leaf)]' : 'bg-[var(--stamp)]'}`} />
          AI {aiConfigured ? 'Ready' : 'Not configured'}
        </span>
        <span className={`stamp ${hasResume ? 'stamp-green' : 'stamp-gold'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${hasResume ? 'bg-[var(--leaf)]' : 'bg-[var(--gold)]'}`} />
          Resume {hasResume ? 'Loaded' : 'Not uploaded'}
          {hasResume && settings?.resumeFileData && (
            <span className="ml-0.5 opacity-60">+</span>
          )}
        </span>
        <span className={`stamp ${gmailConnected ? 'stamp-navy' : 'stamp-gray'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${gmailConnected ? 'bg-[var(--navy)]' : 'bg-[var(--ink-faint)]'}`} />
          Gmail {gmailConnected ? 'Connected' : 'Not signed in'}
        </span>
      </div>

      {/* Image drop zone */}
      {!droppedImage ? (
        <div
          ref={dropRef}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-sm p-10 text-center cursor-pointer transition-all ruled folded-corner ${
            dragOver
              ? 'border-[var(--navy)] bg-[var(--navy-light)]'
              : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)] hover:bg-[var(--paper)]'
          }`}
        >
          <div className="flex justify-center mb-4 text-[var(--border-strong)]">
            <PaperclipMascot size={72} />
          </div>
          <p className="text-sm font-medium text-[var(--ink)]">
            Drop a job posting screenshot here
          </p>
          <p className="text-xs text-[var(--ink-faint)] mt-1">
            or click to browse — JPEG, PNG under 10MB
          </p>
          <p className="text-xs text-[var(--ink-faint)] mt-1">
            or press Ctrl+V to paste from clipboard
          </p>
          <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png" className="hidden" onChange={handleFileSelect} />
        </div>
      ) : (
        <div className="file-card overflow-hidden hole-punch tape">
          <div className="relative">
            <img
              src={droppedImage}
              alt={droppedFileName}
              className="w-full max-h-80 object-contain bg-[var(--paper)]"
            />
            <button
              onClick={handleReset}
              className="absolute top-2 right-2 w-7 h-7 bg-white/80 border border-[var(--border)] text-[var(--ink-muted)] rounded-sm flex items-center justify-center hover:text-[var(--stamp)] hover:border-[var(--stamp)] transition-colors"
              aria-label="Remove image"
              title="Remove"
            >
              <IconX />
            </button>
            <span className="absolute bottom-2 left-2 text-xs font-mono text-[var(--ink-muted)] bg-white/80 px-2 py-0.5 border border-[var(--border)]">
              {droppedFileName}
            </span>
          </div>
          <div className="p-4 border-t border-[var(--border)] space-y-2">
            <div className="flex gap-2">
              <button
                onClick={() => handleScan('review')}
                disabled={!aiConfigured || phase === 'scanning' || phase === 'sending'}
                className="btn btn-secondary flex-1"
              >
                {phase === 'scanning' || phase === 'sending' ? (
                  <><IconSpinner /> {phase === 'scanning' ? 'Scanning...' : 'Sending...'}</>
                ) : (
                  <><IconScan /> Scan</>
                )}
              </button>
              <button
                onClick={() => handleScan('auto')}
                disabled={!aiConfigured || phase === 'scanning' || phase === 'sending'}
                className="btn btn-primary flex-1"
              >
                {phase === 'scanning' || phase === 'sending' ? (
                  <><IconSpinner /> {phase === 'scanning' ? 'Scanning...' : 'Sending...'}</>
                ) : (
                  <><IconScan /> Scan &amp; Send</>
                )}
              </button>
            </div>
            {!aiConfigured && (
              <p className="text-xs text-[var(--stamp)] text-center mt-2">
                Configure your AI API key in Settings first
              </p>
            )}
          </div>
        </div>
      )}

      {/* Streaming output */}
      {(phase === 'scanning' || phase === 'sending') && streamingText && (
        <div className="ink-well p-4 ruled">
          <div className="flex items-center gap-2 mb-2">
            <IconSpinner />
            <span className="text-xs font-mono text-[var(--ink-muted)] uppercase tracking-wider">AI Response</span>
          </div>
          <pre className="text-xs text-[var(--ink)] font-mono leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap">
            {streamingText}
          </pre>
        </div>
      )}

      {/* Sending indicator */}
      {phase === 'sending' && !streamingText && (
        <div className="ink-well p-4 flex items-center gap-3">
          <IconSpinner />
          <p className="text-sm text-[var(--ink)]">Sending email via Gmail...</p>
        </div>
      )}

      {/* Error */}
      {phase === 'error' && (
        <div className="p-4 border border-[var(--stamp)] bg-[var(--stamp-light)]">
          <p className="text-sm font-medium text-[var(--stamp)] mb-1">Error</p>
          <p className="text-sm text-[var(--stamp)] whitespace-pre-wrap">{error}</p>
          {streamingText && (
            <details className="mt-2">
              <summary className="text-xs text-[var(--stamp)] cursor-pointer hover:underline">Show raw AI response</summary>
              <pre className="text-xs text-[var(--ink-muted)] font-mono mt-2 max-h-32 overflow-y-auto whitespace-pre-wrap">{streamingText}</pre>
            </details>
          )}
          <button onClick={handleReset} className="text-xs text-[var(--stamp)] underline mt-2">
            Try again
          </button>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="space-y-4">
          {/* Send status */}
          {sendMsg && (
            <div className={`p-4 border ${
              sendMsg.type === 'sent' ? 'border-[var(--leaf)] bg-[var(--leaf-light)]' :
              sendMsg.type === 'skipped' ? 'border-[var(--gold)] bg-[var(--gold-light)]' :
              'border-[var(--stamp)] bg-[var(--stamp-light)]'
            }`}>
              <p className={`text-sm font-medium ${
                sendMsg.type === 'sent' ? 'text-[var(--leaf)]' :
                sendMsg.type === 'skipped' ? 'text-[var(--gold)]' :
                'text-[var(--stamp)]'
              }`}>
                {sendMsg.text}
              </p>
            </div>
          )}

          {/* Recipient */}
          <div className="file-card p-5 hole-punch stapled">
            <div className="flex items-start justify-between mb-2">
              <p className="text-xs font-mono text-[var(--ink-faint)] uppercase tracking-wider flex items-center gap-1.5">
                <PaperclipIcon /> Recipient</p>
              <DateStamp />
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-sm bg-[var(--paper)] flex items-center justify-center text-[var(--ink-muted)]">
                <IconMail />
              </div>
              <div>
                {result.recipientEmail ? (
                  <a href={`mailto:${result.recipientEmail}`} className="text-sm font-medium text-[var(--navy)] hover:underline">
                    {result.recipientEmail}
                  </a>
                ) : (
                  <span className="text-sm text-[var(--ink-faint)] italic">No email found in image</span>
                )}
                <p className="text-xs text-[var(--ink-muted)] flex items-center gap-1 mt-0.5">
                  <IconPerson /> {result.recipientName}
                </p>
              </div>
            </div>
          </div>

          {/* Job positions */}
          <div className="file-card p-5 hole-punch stapled">
            <p className="text-xs font-mono text-[var(--ink-faint)] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <PaperclipIcon /> Positions
            </p>
            <div className="space-y-3">
              {result.jobPositions.map((jp, i) => {
                const isSelected = selectedJobTitle === jp.title
                const isRegenerating = isSelected && regeneratingEmail
                return (
                <div key={i}
                  onClick={() => !regeneratingEmail && handleSelectPosition(jp.title)}
                  className={`p-4 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[var(--navy-light)] border border-[var(--navy)] ring-1 ring-[var(--navy)]'
                      : 'bg-[var(--paper)] hover:bg-[var(--surface)] border border-transparent hover:border-[var(--border)]'
                  }`}>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-medium text-[var(--ink)]">{jp.title}</h3>
                    <div className="flex items-center gap-2">
                      {isRegenerating && (
                        <span className="flex items-center gap-1 text-xs font-mono text-[var(--navy)]">
                          <IconSpinner /> Switching...
                        </span>
                      )}
                      {jp.matchScore !== undefined && (
                        <span className={`text-xs font-mono font-medium px-2 py-0.5 rounded-sm ${
                          jp.matchScore >= 80 ? 'bg-[var(--leaf-light)] text-[var(--leaf)]' :
                          jp.matchScore >= 50 ? 'bg-[var(--gold-light)] text-[var(--gold)]' :
                          'bg-[var(--stamp-light)] text-[var(--stamp)]'
                        }`}>
                          {jp.matchScore}% match
                        </span>
                      )}
                      {isSelected && (
                        <span className="stamp stamp-navy">Selected</span>
                      )}
                    </div>
                  </div>
                  {jp.matchReasons && jp.matchReasons.length > 0 && (
                    <p className="text-xs text-[var(--ink-muted)] mb-2 leading-relaxed">
                      {jp.matchReasons.map((r, j) => (
                        <span key={j} className="block">
                          <span className="text-[var(--ink-faint)]">—</span> {r}
                        </span>
                      ))}
                    </p>
                  )}
                  <ul className="space-y-1">
                    {jp.qualifications.map((q, j) => (
                      <li key={j} className="text-xs text-[var(--ink-muted)] flex gap-2">
                        <span className="text-[var(--ink-faint)]">—</span>
                        {q}
                      </li>
                    ))}
                  </ul>
                </div>
              )})}
            </div>
          </div>

          {/* Generated email — review mode (editable) */}
          {mode === 'review' ? (
            <div className="file-card overflow-hidden hole-punch tape">
              <div className="p-5 border-b border-[var(--border)]">
                <p className="text-xs font-mono text-[var(--ink-faint)] uppercase tracking-wider flex items-center gap-1.5">
                  <PaperclipIcon /> <IconMail /> Review &amp; Send
                  {selectedJobTitle && <span className="text-[var(--ink-muted)] normal-case">— {selectedJobTitle}</span>}
                </p>
              </div>
              {regeneratingEmail ? (
                <div className="p-10 text-center text-[var(--ink-muted)]">
                  <IconSpinner /> Regenerating email for selected role...
                </div>
              ) : (
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--ink)] mb-1">Recipient Email</label>
                  <input type="email" value={editRecipient} onChange={(e) => setEditRecipient(e.target.value)}
                    placeholder="hr@company.com" className="field" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--ink)] mb-1">Subject</label>
                  <input type="text" value={editSubject} onChange={(e) => setEditSubject(e.target.value)}
                    className="field" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--ink)] mb-1">Message</label>
                  <textarea value={editBody} onChange={(e) => setEditBody(e.target.value)}
                    rows={10} className="field resize-none font-mono text-xs leading-relaxed" />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleSendReview} disabled={sendingEmail || !editRecipient}
                    className="btn btn-primary flex-1">
                    {sendingEmail ? <><IconSpinner /> Sending...</> : <><IconMail /> Send via Gmail</>}
                  </button>
                  <button onClick={handleCopy} className="btn btn-secondary">
                    {copied ? <><IconCheck /> Copied</> : <><IconCopy /> Copy</>}
                  </button>
                </div>
                {sendMsg && (
                  <p className={`text-xs ${sendMsg.type === 'sent' ? 'text-[var(--leaf)]' : sendMsg.type === 'error' ? 'text-[var(--stamp)]' : 'text-[var(--gold)]'}`}>
                    {sendMsg.text}
                  </p>
                )}
              </div>
              )}
            </div>
          ) : regeneratingEmail ? (
                      <div className="file-card overflow-hidden hole-punch tape">
                        <div className="p-10 text-center text-[var(--ink-muted)]">
                          <IconSpinner /> Regenerating email for selected role...
                        </div>
                      </div>
                    ) : (
                    /* Generated email — read-only result */
          <div className="file-card overflow-hidden hole-punch tape">
            <div className="p-5 border-b border-[var(--border)]">
              <div className="flex items-center justify-between">
                <p className="text-xs font-mono text-[var(--ink-faint)] uppercase tracking-wider flex items-center gap-1.5">
                  <PaperclipIcon /> <IconMail /> Email
                  {selectedJobTitle && <span className="text-[var(--ink-muted)] normal-case">— {selectedJobTitle}</span>}
                </p>
                <button
                  onClick={handleCopy}
                  className="btn-ghost text-xs flex items-center gap-1"
                >
                  {copied ? <><IconCheck /> Copied</> : <><IconCopy /> Copy</>}
                </button>
              </div>
              <p className="text-sm font-medium text-[var(--ink)] mt-2">
                Subject: {result.outreachEmail.subject}
              </p>
            </div>
            <div className="p-5">
              <pre className="text-sm text-[var(--ink)] font-[var(--sans)] leading-relaxed whitespace-pre-wrap">
                {result.outreachEmail.body}
              </pre>
            </div>
          </div>
          )}

          {/* New scan */}
          <button onClick={handleReset} className="btn btn-secondary w-full">
            Scan Another Job Posting
          </button>
        </div>
      )}

      {/* Validation modal */}
      {validationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setValidationModal(null)} />
          <div className="relative bg-[var(--surface)] border border-[var(--border)] shadow-xl rounded-sm p-6 max-w-sm w-full mx-4 text-center">
            <div className="flex justify-center mb-3 text-[var(--stamp)]">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h2 className="font-[var(--display)] text-lg text-[var(--ink)] mb-2">{validationModal.title}</h2>
            <p className="text-sm text-[var(--ink-muted)] mb-6">{validationModal.message}</p>
            <button onClick={() => setValidationModal(null)} className="btn btn-primary text-sm">
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  )
}