// ─── Landing Page — About / Home ────────────────────────────
// Mode: Persuade — the visitor decides to act
// World: Archive/Document (established)

function ArrowRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  )
}

function IconPaperclip() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
    </svg>
  )
}

function IconScan() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="9" y1="3" x2="9" y2="21" />
      <line x1="15" y1="3" x2="15" y2="21" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="3" y1="15" x2="21" y2="15" />
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

function IconMail() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M2 4l10 8 10-8" />
    </svg>
  )
}

function IconLock() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  )
}

function IconCompass() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  )
}

// ─── Hero illustration ─────────────────────────────────────
function HeroIllustration() {
  return (
    <svg width="320" height="240" viewBox="0 0 320 240" fill="none" className="w-full max-w-sm mx-auto">
      {/* Paper surface */}
      <rect x="15" y="8" width="290" height="224" rx="4" fill="var(--surface)" stroke="var(--border)" strokeWidth="1" />
      {/* Paperclip */}
      <path d="M285 6h-14c-2.5 0-4.5 2-4.5 4.5v16c0 2.5 2 4.5 4.5 4.5h14" stroke="var(--border-strong)" strokeWidth="1.5" fill="var(--surface)" />
      <circle cx="278" cy="13" r="2.2" fill="var(--border-strong)" />
      {/* Ruled lines */}
      {[30, 48, 66, 84, 102, 120, 138, 156, 174, 192].map(y => (
        <line key={y} x1="35" y1={y} x2="290" y2={y} stroke="var(--border)" strokeWidth="0.5" opacity="0.35" />
      ))}
      {/* Red margin */}
      <line x1="31" y1="22" x2="31" y2="220" stroke="var(--stamp)" strokeWidth="1" opacity="0.25" />
      {/* Screenshot area */}
      <rect x="45" y="34" width="160" height="110" rx="2" fill="var(--paper)" stroke="var(--border)" strokeWidth="1" strokeDasharray="4 3" />
      <text x="125" y="94" textAnchor="middle" fontSize="9" fill="var(--ink-faint)" fontFamily="IBM Plex Mono">JOB POSTING</text>
      <text x="125" y="106" textAnchor="middle" fontSize="7" fill="var(--ink-faint)" fontFamily="IBM Plex Mono">SCREENSHOT</text>
      {/* Arrow from screenshot to stamp */}
      <path d="M205 100l12 0-4-4m4 4l-4 4" stroke="var(--navy)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Stamp */}
      <g transform="rotate(2, 260, 190)">
        <rect x="225" y="172" width="55" height="30" rx="1" stroke="var(--stamp)" strokeWidth="1.2" fill="var(--stamp-light)" />
        <text x="252" y="188" textAnchor="middle" fontSize="9" fontFamily="IBM Plex Mono" fill="var(--stamp)" fontWeight="500">RECEIVED</text>
        <text x="252" y="198" textAnchor="middle" fontSize="7" fontFamily="IBM Plex Mono" fill="var(--stamp)">AUG 20, 2026</text>
      </g>
      {/* Sent badge */}
      <g transform="translate(30, 195)">
        <rect x="0" y="0" width="46" height="20" rx="2" fill="var(--leaf-light)" stroke="var(--leaf)" strokeWidth="1" />
        <text x="23" y="14" textAnchor="middle" fontSize="8" fontFamily="IBM Plex Mono" fill="var(--leaf)" fontWeight="500">SENT</text>
      </g>
    </svg>
  )
}

// ─── Step illustrations ────────────────────────────────────
function StepOneIllustration() {
  return (
    <svg width="200" height="120" viewBox="0 0 200 120" fill="none" className="w-full max-w-[200px] mx-auto">
      <rect x="10" y="10" width="180" height="100" rx="4" fill="var(--surface)" stroke="var(--border)" strokeWidth="1" />
      <path d="M175 8h-10c-2 0-3.5 1.5-3.5 3.5v12c0 2 1.5 3.5 3.5 3.5h10" stroke="var(--border-strong)" strokeWidth="1.2" fill="var(--surface)" />
      <rect x="30" y="24" width="100" height="64" rx="2" fill="var(--paper)" stroke="var(--border)" strokeWidth="1" strokeDasharray="3 2" />
      <text x="80" y="60" textAnchor="middle" fontSize="8" fill="var(--ink-faint)" fontFamily="IBM Plex Mono">Ctrl+V</text>
      <text x="80" y="72" textAnchor="middle" fontSize="7" fill="var(--ink-faint)" fontFamily="IBM Plex Mono">or drag</text>
      <path d="M145 55l12 0-4-4m4 4l-4 4" stroke="var(--navy)" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function StepTwoIllustration() {
  return (
    <svg width="200" height="120" viewBox="0 0 200 120" fill="none" className="w-full max-w-[200px] mx-auto">
      <rect x="10" y="10" width="180" height="100" rx="4" fill="var(--surface)" stroke="var(--border)" strokeWidth="1" />
      <path d="M175 8h-10c-2 0-3.5 1.5-3.5 3.5v12c0 2 1.5 3.5 3.5 3.5h10" stroke="var(--border-strong)" strokeWidth="1.2" fill="var(--surface)" />
      <rect x="30" y="24" width="90" height="64" rx="2" fill="var(--paper)" stroke="var(--border)" strokeWidth="1" />
      {[36, 48, 60, 72].map(y => (<line key={y} x1="40" y1={y} x2="110" y2={y} stroke="var(--ink-faint)" strokeWidth="0.5" opacity="0.3" />))}
      <circle cx="140" cy="50" r="16" stroke="var(--navy)" strokeWidth="1.5" fill="none" />
      <line x1="152" y1="62" x2="162" y2="72" stroke="var(--navy)" strokeWidth="1.5" strokeLinecap="round" />
      <text x="140" y="95" textAnchor="middle" fontSize="7" fontFamily="IBM Plex Mono" fill="var(--navy)">AI SCANS</text>
    </svg>
  )
}

function StepThreeIllustration() {
  return (
    <svg width="200" height="120" viewBox="0 0 200 120" fill="none" className="w-full max-w-[200px] mx-auto">
      <rect x="10" y="10" width="180" height="100" rx="4" fill="var(--surface)" stroke="var(--border)" strokeWidth="1" />
      <path d="M175 8h-10c-2 0-3.5 1.5-3.5 3.5v12c0 2 1.5 3.5 3.5 3.5h10" stroke="var(--border-strong)" strokeWidth="1.2" fill="var(--surface)" />
      <rect x="35" y="32" width="60" height="44" rx="2" stroke="var(--leaf)" strokeWidth="1.2" fill="var(--leaf-light)" />
      <path d="M35 32l30 20 30-20" stroke="var(--leaf)" strokeWidth="1.2" />
      <circle cx="130" cy="50" r="16" fill="var(--leaf-light)" stroke="var(--leaf)" strokeWidth="1.2" />
      <polyline points="123 50 128 55 137 46" stroke="var(--leaf)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <text x="130" y="95" textAnchor="middle" fontSize="7" fontFamily="IBM Plex Mono" fill="var(--leaf)">SENT</text>
    </svg>
  )
}

// ─── Component ──────────────────────────────────────────────
export default function Landing() {
  return (
    <div className="space-y-24">

      {/* ─── Hero ──────────────────────────────────────────── */}
      <section className="text-center pt-10 pb-4">
        <div className="flex justify-center mb-8 entrance">
          <HeroIllustration />
        </div>
        <h1 className="font-[var(--display)] text-5xl sm:text-6xl text-[var(--ink)] leading-[1.1] max-w-lg mx-auto entrance entrance-delay-1">
          Snap2Email
        </h1>
        <p className="text-[var(--ink-muted)] text-xl mt-4 max-w-xl mx-auto leading-relaxed entrance entrance-delay-2" style={{ maxWidth: '65ch' }}>
          Drop a job posting screenshot. The AI reads it, matches your resume, and sends a tailored outreach email — all in one click.
        </p>
        <div className="flex gap-3 justify-center mt-8 entrance entrance-delay-3">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('switch-tab', { detail: 'scan' }))}
            className="btn btn-primary"
          >
            Try It <ArrowRight />
          </button>
          <button
            onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
            className="btn btn-secondary"
          >
            How It Works
          </button>
        </div>
      </section>

      {/* ─── Problem ────────────────────────────────────────── */}
      <section className="max-w-2xl mx-auto">
        <div className="border-l-2 border-[var(--stamp)] pl-5">
          <p className="text-xs font-mono text-[var(--ink-faint)] uppercase tracking-wider mb-1">The Problem</p>
          <h2 className="font-[var(--display)] text-3xl text-[var(--ink)] leading-tight">
            Job hunting is the same exhausting routine, over and over.
          </h2>
        </div>
        <div className="mt-5 space-y-3 text-base text-[var(--ink-muted)] leading-relaxed" style={{ maxWidth: '65ch' }}>
          <p className="text-[var(--ink-muted)]">
            It's exhausting doing the same repetitive steps for every single application. Hunting down the job post, digging up the right email, then switching to Gmail to write a custom message from scratch, every time.
          </p>
          <p className="text-[var(--ink-muted)]">
            This tool cuts that down. What used to take 10 minutes now takes about one.
          </p>
        </div>
      </section>

      {/* ─── How It Works ──────────────────────────────────── */}
      <section id="how-it-works">
        <div className="border-l-2 border-[var(--navy)] pl-5 mb-10">
          <p className="text-xs font-mono text-[var(--ink-faint)] uppercase tracking-wider mb-1">The Process</p>
          <h2 className="font-[var(--display)] text-3xl text-[var(--ink)] leading-tight">
            Three steps from screenshot to sent
          </h2>
        </div>

        {/* Step 1 */}
        <div className="grid sm:grid-cols-2 gap-6 sm:gap-8 items-center mb-6">
          <div className="order-2 sm:order-1">
            <h3 className="font-[var(--display)] text-2xl text-[var(--ink)]">Drop a screenshot</h3>
            <p className="text-base text-[var(--ink-muted)] mt-2 leading-relaxed" style={{ maxWidth: '65ch' }}>
              Take a screenshot of any job posting — LinkedIn, careers page, or email.
              Drag it into the app or press Ctrl+V. JPEG and PNG under 10MB.
            </p>
          </div>
          <div className="order-1 sm:order-2">
            <StepOneIllustration />
          </div>
        </div>

        {/* Connecting line */}
        <div className="flex justify-center py-2">
          <div className="w-px h-8 bg-[var(--border-strong)]" />
        </div>

        {/* Step 2 */}
        <div className="grid sm:grid-cols-2 gap-6 sm:gap-8 items-center mb-6">
          <div>
            <StepTwoIllustration />
          </div>
          <div>
            <h3 className="font-[var(--display)] text-2xl text-[var(--ink)]">AI scans and matches</h3>
            <p className="text-base text-[var(--ink-muted)] mt-2 leading-relaxed" style={{ maxWidth: '65ch' }}>
              The AI reads the job description, extracts the hiring manager's email, and compares
              the requirements against your uploaded resume. It identifies the 3-5 strongest
              matches and selects the best-fitting position.
            </p>
          </div>
        </div>

        {/* Connecting line */}
        <div className="flex justify-center py-2">
          <div className="w-px h-8 bg-[var(--border-strong)]" />
        </div>

        {/* Step 3 */}
        <div className="grid sm:grid-cols-2 gap-6 sm:gap-8 items-center">
          <div className="order-2 sm:order-1">
            <h3 className="font-[var(--display)] text-2xl text-[var(--ink)]">Email sent automatically</h3>
            <p className="text-base text-[var(--ink-muted)] mt-2 leading-relaxed" style={{ maxWidth: '65ch' }}>
              A personalized outreach email is generated and sent via your Gmail account,
              with your resume PDF attached. Review mode lets you edit before sending.
            </p>
          </div>
          <div className="order-1 sm:order-2">
            <StepThreeIllustration />
          </div>
        </div>
      </section>

      {/* ─── Two Modes ──────────────────────────────────────── */}
      <section className="grid sm:grid-cols-2 gap-0 border border-[var(--border)] shadow-sm">
        <div className="p-6 sm:p-8 border-b sm:border-b-0 sm:border-r border-[var(--border)] transition-colors hover:bg-[var(--paper)]">
          <div className="flex items-center gap-2 mb-3">
            <IconScan />
            <p className="text-xs font-mono text-[var(--ink-faint)] uppercase tracking-wider">Quick Mode</p>
          </div>
          <p className="text-base font-medium text-[var(--ink)] mb-1">Scan &amp; Send</p>
          <p className="text-sm text-[var(--ink-muted)] leading-relaxed">
            One click. Scans the image, generates the email, and sends it immediately.
            For when speed matters.
          </p>
        </div>
        <div className="p-6 sm:p-8 transition-colors hover:bg-[var(--paper)]">
          <div className="flex items-center gap-2 mb-3">
            <IconEye />
            <p className="text-xs font-mono text-[var(--ink-faint)] uppercase tracking-wider">Review Mode</p>
          </div>
          <p className="text-base font-medium text-[var(--ink)] mb-1">Scan &amp; Review</p>
          <p className="text-sm text-[var(--ink-muted)] leading-relaxed">
            Scans the image, shows the generated email in an editable form.
            Edit the recipient, subject, or body before sending.
          </p>
        </div>
      </section>

      {/* ─── Features ──────────────────────────────────────── */}
      <section id="features">
        <div className="border-l-2 border-[var(--leaf)] pl-5 mb-8">
          <p className="text-xs font-mono text-[var(--ink-faint)] uppercase tracking-wider mb-1">Capabilities</p>
          <h2 className="font-[var(--display)] text-3xl text-[var(--ink)] leading-tight">
            What it does
          </h2>
        </div>

        <div className="space-y-0 border border-[var(--border)] shadow-sm">
          <div className="flex items-start gap-4 p-5 border-b border-[var(--border)] transition-colors hover:bg-[var(--paper)]">
            <div className="w-9 h-9 rounded-sm bg-[var(--paper)] flex items-center justify-center shrink-0 text-[var(--ink-muted)]"><IconScan /></div>
            <div className="min-w-0">
              <p className="text-base font-medium text-[var(--ink)]">Vision-based scanning</p>
              <p className="text-sm text-[var(--ink-muted)] mt-0.5 leading-relaxed">Reads text from any image. Screenshots, photos of printed postings, PDF exports. No copy-paste needed.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-5 border-b border-[var(--border)] transition-colors hover:bg-[var(--paper)]">
            <div className="w-9 h-9 rounded-sm bg-[var(--paper)] flex items-center justify-center shrink-0 text-[var(--ink-muted)]"><IconPaperclip /></div>
            <div className="min-w-0">
              <p className="text-base font-medium text-[var(--ink)]">Resume matching</p>
              <p className="text-sm text-[var(--ink-muted)] mt-0.5 leading-relaxed">Compares job requirements against your resume. The AI identifies the best match and writes around it, naturally.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-5 border-b border-[var(--border)] transition-colors hover:bg-[var(--paper)]">
            <div className="w-9 h-9 rounded-sm bg-[var(--paper)] flex items-center justify-center shrink-0 text-[var(--ink-muted)]"><IconMail /></div>
            <div className="min-w-0">
              <p className="text-base font-medium text-[var(--ink)]">Gmail integration</p>
              <p className="text-sm text-[var(--ink-muted)] mt-0.5 leading-relaxed">Authenticate once. Emails are sent directly from your inbox. Your resume is attached automatically.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-5 border-b border-[var(--border)] transition-colors hover:bg-[var(--paper)]">
            <div className="w-9 h-9 rounded-sm bg-[var(--paper)] flex items-center justify-center shrink-0 text-[var(--ink-muted)]"><IconEye /></div>
            <div className="min-w-0">
              <p className="text-base font-medium text-[var(--ink)]">Two modes</p>
              <p className="text-sm text-[var(--ink-muted)] mt-0.5 leading-relaxed">Quick mode for speed. Review mode for control. Edit the recipient, subject, and body before sending.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-5 border-b border-[var(--border)] transition-colors hover:bg-[var(--paper)]">
            <div className="w-9 h-9 rounded-sm bg-[var(--paper)] flex items-center justify-center shrink-0 text-[var(--ink-muted)]"><IconLock /></div>
            <div className="min-w-0">
              <p className="text-base font-medium text-[var(--ink)]">Privacy-first</p>
              <p className="text-sm text-[var(--ink-muted)] mt-0.5 leading-relaxed">Your resume is stored locally. The AI API key stays on the server. No data leaves your browser except to the AI and Gmail.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-5 transition-colors hover:bg-[var(--paper)]">
            <div className="w-9 h-9 rounded-sm bg-[var(--paper)] flex items-center justify-center shrink-0 text-[var(--ink-muted)]"><IconCompass /></div>
            <div className="min-w-0">
              <p className="text-base font-medium text-[var(--ink)]">Archive theme</p>
              <p className="text-sm text-[var(--ink-muted)] mt-0.5 leading-relaxed">A warm paper-and-ink interface. Stamps, paperclips, ruled lines. Not another generic dashboard.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Tech Stack ──────────────────────────────────────── */}
      <section className="border-l-2 border-[var(--border-strong)] pl-5">
        <p className="text-xs font-mono text-[var(--ink-faint)] uppercase tracking-wider mb-4">Built with</p>
        <div className="flex flex-wrap gap-2">
          {[
            { name: 'React 19', color: 'var(--navy-light)', text: 'var(--navy)' },
            { name: 'TypeScript 6', color: 'var(--navy-light)', text: 'var(--navy)' },
            { name: 'Vite 8', color: 'var(--navy-light)', text: 'var(--navy)' },
            { name: 'Tailwind 4', color: 'var(--navy-light)', text: 'var(--navy)' },
            { name: 'Dexie', color: 'var(--leaf-light)', text: 'var(--leaf)' },
            { name: 'OpenRouter', color: 'var(--leaf-light)', text: 'var(--leaf)' },
            { name: 'Gmail API', color: 'var(--leaf-light)', text: 'var(--leaf)' },
            { name: 'Node.js', color: 'var(--stamp-light)', text: 'var(--stamp)' },
          ].map(({ name, color, text }) => (
            <span key={name} className="text-xs font-mono px-2.5 py-1 rounded-sm border" style={{ background: color, color: text, borderColor: 'transparent' }}>
              {name}
            </span>
          ))}
        </div>
      </section>

      {/* ─── CTA ─────────────────────────────────────────────── */}
      <section className="text-center py-8 border-t border-[var(--border)]">
        <h2 className="font-[var(--display)] text-3xl text-[var(--ink)] mb-3">
          Ready to try it?
        </h2>
        <p className="text-base text-[var(--ink-muted)] mb-6 max-w-md mx-auto">
          Configure your API key, upload your resume, and start scanning.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('switch-tab', { detail: 'scan' }))}
            className="btn btn-primary"
          >
            Go to Scan <ArrowRight />
          </button>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('switch-tab', { detail: 'settings' }))}
            className="btn btn-secondary"
          >
            Settings
          </button>
        </div>
      </section>

    </div>
  )
}