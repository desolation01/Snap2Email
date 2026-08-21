// ─── 404 Page — Not Found ──────────────────────────────────

function IconFile() {
  return (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="9" y1="15" x2="15" y2="15" />
      <line x1="12" y1="12" x2="12" y2="18" />
    </svg>
  )
}

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-sm">
        <div className="flex justify-center mb-6 text-[var(--ink-faint)]">
          <IconFile />
        </div>
        <div className="stamp stamp-red inline-block mb-4">404</div>
        <h1 className="font-[var(--display)] text-2xl text-[var(--ink)] mb-2">
          Page not found
        </h1>
        <p className="text-sm text-[var(--ink-muted)] mb-6 leading-relaxed">
          This document doesn't exist in the filing system. It may have been moved, deleted, or never filed.
        </p>
        <a href="/" className="btn btn-primary inline-flex items-center gap-1.5">
          Back to Home
        </a>
      </div>
    </div>
  )
}