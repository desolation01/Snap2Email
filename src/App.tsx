import { useState, useEffect } from 'react'
import Landing from './pages/Landing'
import Scan from './pages/Scan'
import Settings from './pages/Settings'
import NotFound from './pages/NotFound'

type Tab = 'about' | 'scan' | 'settings'

function HomeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 7l6-5 6 5v7a1 1 0 01-1 1H3a1 1 0 01-1-1z" />
      <path d="M6 14V9h4v5" />
    </svg>
  )
}

function ScanIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1.5" y="1.5" width="13" height="13" rx="1.5" />
      <line x1="5.5" y1="1.5" x2="5.5" y2="14.5" />
      <line x1="10.5" y1="1.5" x2="10.5" y2="14.5" />
      <line x1="1.5" y1="5.5" x2="14.5" y2="5.5" />
      <line x1="1.5" y1="10.5" x2="14.5" y2="10.5" />
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="2.5" />
      <path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" />
    </svg>
  )
}

export default function App() {
  const [tab, setTab] = useState<Tab>('about')
  const [notFound, setNotFound] = useState(false)

  // Check URL for 404
  useEffect(() => {
    const path = window.location.pathname
    if (path !== '/' && path !== '/about' && path !== '/scan' && path !== '/settings') {
      setNotFound(true)
    }
  }, [])

  // Listen for tab-switch events from the Landing page CTA buttons
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (detail === 'scan' || detail === 'settings') {
        setTab(detail)
      }
    }
    window.addEventListener('switch-tab', handler)
    return () => window.removeEventListener('switch-tab', handler)
  }, [])

  return (
    <div className="flex flex-col h-full">
      {notFound ? (
        <main className="flex-1 overflow-auto bg-[var(--surface)] mx-4 sm:mx-6">
          <div className="max-w-5xl mx-auto px-6 py-8">
            <NotFound />
          </div>
        </main>
      ) : (
      <>
      {/* Header — like a file folder tab */}
      <div className="shrink-0 px-4 sm:px-6 pt-4">
        <div className="flex items-end gap-1 pl-3">
          <button onClick={() => setTab('about')}
            className={`folder-tab ${tab === 'about' ? 'active' : ''}`}>
            <span className="flex items-center gap-1.5">
              <HomeIcon /> About
            </span>
          </button>
          <button onClick={() => setTab('scan')}
            className={`folder-tab ${tab === 'scan' ? 'active' : ''}`}>
            <span className="flex items-center gap-1.5">
              <ScanIcon /> Scan
            </span>
          </button>
          <button onClick={() => setTab('settings')}
            className={`folder-tab ${tab === 'settings' ? 'active' : ''}`}>
            <span className="flex items-center gap-1.5">
              <SettingsIcon /> Settings
            </span>
          </button>
          <div className="flex-1 h-full border-b border-[var(--border)]" />
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-[var(--surface)] border-x border-b border-[var(--border)] mx-4 sm:mx-6 rounded-b-sm">
        <div className="max-w-5xl mx-auto px-6 py-8">
          {tab === 'about' && <Landing />}
          {tab === 'scan' && <Scan />}
          {tab === 'settings' && <Settings />}
        </div>
      </main>
      </>
      )}
    </div>
  )
}