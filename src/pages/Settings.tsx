import { useEffect, useRef, useState } from 'react'
import { getSettings, saveSettings } from '../lib/db'
import { testAiConnection } from '../lib/ai'
import { parseResumeToMarkdown, formatFileSize } from '../lib/resume'
import type { AppSettings } from '../lib/types'

// ─── SVG Icons ──────────────────────────────────────────────

function PaperclipIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
    </svg>
  )
}

function IconCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
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

function IconEye() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function IconTrash() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    </svg>
  )
}

function IconUpload() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  )
}

function IconPerson() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function IconDoc() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  )
}

// ─── Component ──────────────────────────────────────────────

export default function Settings() {
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [aiTestResult, setAiTestResult] = useState<'idle' | 'testing' | 'ok' | 'fail'>('idle')
  const [aiError, setAiError] = useState('')
  const [resumeParsing, setResumeParsing] = useState(false)
  const [resumeError, setResumeError] = useState('')
  const [resumeSuccess, setResumeSuccess] = useState('')
  const [resumePreview, setResumePreview] = useState(false)
  const [validationModal, setValidationModal] = useState<{ title: string; message: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { getSettings().then(setSettings) }, [])

  async function handleSave() {
    if (!settings) return
    setSaving(true)
    setSaved(false)
    await saveSettings(settings)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function handleTestAi() {
    setAiTestResult('testing')
    const result = await testAiConnection()
    setAiTestResult(result.ok ? 'ok' : 'fail')
    if (!result.ok) setAiError(result.message)
    else setAiError('')
    setTimeout(() => { setAiTestResult('idle'); setAiError('') }, 5000)
  }

  async function handleResumeUpload(file: File) {
    // Validate: PDF only
    if (file.type !== 'application/pdf') {
      setValidationModal({ title: 'Invalid File Type', message: 'Only PDF files are accepted for resumes.' })
      return
    }
    // Magic-byte verification for PDF (%PDF header)
    try {
      const header = await file.slice(0, 4).arrayBuffer()
      const view = new Uint8Array(header)
      const isPDF = view[0] === 0x25 && view[1] === 0x50 && view[2] === 0x44 && view[3] === 0x46
      if (!isPDF) {
        setValidationModal({ title: 'Invalid File', message: 'The file content does not match a valid PDF.' })
        return
      }
    } catch {
      setValidationModal({ title: 'Read Error', message: 'Could not read the file. Please try again.' })
      return
    }
    // Validate: max 5MB
    const MAX_SIZE = 5 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      setValidationModal({ title: 'File Too Large', message: 'Resume must be under 5MB.' })
      return
    }
    setResumeError('')
    setResumeSuccess('')
    setResumeParsing(true)
    try {
      const markdown = await parseResumeToMarkdown(file)
      const fileData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          const result = reader.result as string
          const comma = result.indexOf(',')
          resolve(comma >= 0 ? result.slice(comma + 1) : result)
        }
        reader.onerror = () => reject(reader.error)
        reader.readAsDataURL(file)
      })
      if (!settings) return
      const updated = { ...settings, resumeMarkdown: markdown, resumeFileName: file.name, resumeFileData: fileData, resumeFileMime: file.type }
      await saveSettings(updated)
      setSettings(updated)
      setResumeSuccess(`Resume loaded: ${file.name} (${formatFileSize(file.size)})`)
    } catch (err) {
      setResumeError(err instanceof Error ? err.message : 'Failed to parse resume')
    } finally {
      setResumeParsing(false)
    }
  }

  async function handleRemoveResume() {
    if (!settings) return
    const updated = { ...settings, resumeMarkdown: undefined, resumeFileName: undefined, resumeFileData: undefined, resumeFileMime: undefined }
    await saveSettings(updated)
    setSettings(updated)
    setResumeSuccess('Resume removed')
  }

  function update(key: keyof AppSettings, value: string | boolean) {
    if (!settings) return
    setSettings({ ...settings, [key]: value })
  }

  if (!settings) return null

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-[var(--display)] text-2xl text-[var(--ink)]">Settings</h1>
        <button onClick={handleSave} disabled={saving} className="btn btn-primary text-xs">
          {saving ? <><IconSpinner /> Saving...</> : saved ? <><IconCheck /> Saved</> : 'Save Settings'}
        </button>
      </div>

      <div className="space-y-5">
        {/* AI Profile */}
        <div className="file-card p-6">
          <h2 className="text-xs font-mono text-[var(--ink-muted)] uppercase tracking-wider mb-4 flex items-center gap-2">
            <PaperclipIcon /> AI Profile
          </h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-[var(--ink)] mb-1">Instructions</label>
              <textarea value={settings.aiInstructions} onChange={(e) => update('aiInstructions', e.target.value)}
                placeholder="e.g. Write as a senior software engineer with 10 years of experience. Be concise and confident."
                rows={3} className="field resize-none" />
              <p className="text-xs text-[var(--ink-muted)] mt-1">
                Custom instructions the AI follows when writing outreach emails.
              </p>
            </div>
            <button onClick={handleTestAi}
              className={`btn text-xs ${
                aiTestResult === 'ok' ? 'stamp stamp-green' :
                aiTestResult === 'fail' ? 'stamp stamp-red' :
                'btn-secondary'
              }`}>
              {aiTestResult === 'testing' ? <><IconSpinner /> Testing...</> :
               aiTestResult === 'ok' ? <><IconCheck /> Connected</> :
               aiTestResult === 'fail' ? 'Connection Failed' :
               'Test Connection'}
            </button>
            {aiError && <p className="text-xs text-[var(--stamp)]">{aiError}</p>}
          </div>
        </div>

        {/* Sender Info */}
        <div className="file-card p-6">
          <h2 className="text-xs font-mono text-[var(--ink-muted)] uppercase tracking-wider mb-4 flex items-center gap-2">
            <PaperclipIcon /> <IconPerson /> Sender Information
          </h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-[var(--ink)] mb-1">Your Name</label>
              <input type="text" value={settings.senderName} onChange={(e) => update('senderName', e.target.value)}
                placeholder="e.g. John Doe" className="field" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--ink)] mb-1">Your Email</label>
              <input type="email" value={settings.senderEmail} onChange={(e) => update('senderEmail', e.target.value)}
                placeholder="e.g. john@example.com" className="field" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--ink)] mb-1">Your Portfolio</label>
              <input type="url" value={settings.portfolioUrl} onChange={(e) => update('portfolioUrl', e.target.value)}
                placeholder="e.g. https://your-portfolio.com" className="field" />
              <p className="text-xs text-[var(--ink-muted)] mt-1">
                The AI includes this link in the email signature.
              </p>
            </div>
            <div className="flex items-center justify-between pt-1">
              <div>
                <label className="block text-xs font-medium text-[var(--ink)]">Graduated</label>
                <p className="text-xs text-[var(--ink-muted)] mt-0.5">Tells the AI whether you have already graduated</p>
              </div>
              <button
                onClick={() => update('isGraduated', !settings.isGraduated)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  settings.isGraduated ? 'bg-[var(--leaf)]' : 'bg-[var(--border-strong)]'
                }`}
                role="switch"
                aria-checked={settings.isGraduated}
                aria-label="Toggle graduation status"
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                  settings.isGraduated ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Resume */}
        <div className="file-card p-6">
          <h2 className="text-xs font-mono text-[var(--ink-muted)] uppercase tracking-wider mb-4 flex items-center gap-2">
            <PaperclipIcon /> <IconDoc /> Resume
          </h2>
          <p className="text-xs text-[var(--ink-muted)] mb-4 leading-relaxed">
            Upload your resume so the AI can match your skills against job postings.
            Supports PDF files under 5MB. Stored locally.
          </p>

          {settings.resumeMarkdown ? (
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="stamp stamp-green">Loaded</span>
                <span className="text-sm text-[var(--ink)]">{settings.resumeFileName}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setResumePreview(!resumePreview)} className="btn-ghost text-xs flex items-center gap-1">
                  <IconEye /> {resumePreview ? 'Hide' : 'Preview'}
                </button>
                <button onClick={handleRemoveResume} className="btn-ghost text-xs flex items-center gap-1" style={{ color: 'var(--stamp)' }}>
                  <IconTrash /> Remove
                </button>
                <label className="btn btn-secondary text-xs cursor-pointer">
                  Replace
                  <input type="file" accept=".pdf" className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleResumeUpload(f) }} />
                </label>
              </div>
              {resumePreview && (
                <div className="mt-3 ink-well p-4 max-h-48 overflow-y-auto">
                  <pre className="text-xs text-[var(--ink)] font-mono leading-relaxed whitespace-pre-wrap">{settings.resumeMarkdown}</pre>
                </div>
              )}
            </div>
          ) : (
            <div
              className="border-2 border-dashed border-[var(--border)] p-8 text-center cursor-pointer hover:border-[var(--border-strong)] hover:bg-[var(--paper)] transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="flex justify-center mb-2 text-[var(--ink-muted)]">
                <IconUpload />
              </div>
              <p className="text-sm font-medium text-[var(--ink)]">
                {resumeParsing ? 'Parsing resume...' : 'Click to upload your resume'}
              </p>
              <p className="text-xs text-[var(--ink-faint)] mt-1">PDF only, max 5MB</p>
              <input ref={fileInputRef} type="file" accept=".pdf" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleResumeUpload(f) }} />
            </div>
          )}

          {resumeParsing && (
            <div className="mt-3 flex items-center gap-2 text-xs text-[var(--navy)]">
              <IconSpinner /> Converting to Markdown...
            </div>
          )}
          {resumeError && <p className="mt-2 text-xs text-[var(--stamp)]">{resumeError}</p>}
          {resumeSuccess && <p className="mt-2 text-xs text-[var(--leaf)]">{resumeSuccess}</p>}
        </div>
      </div>

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