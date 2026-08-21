// ─── App Settings (persisted in IndexedDB) ────────────────────
export interface AppSettings {
  id: string
  aiInstructions: string
  senderName: string
  senderEmail: string
  portfolioUrl: string
  isGraduated: boolean
  resumeMarkdown?: string
  resumeFileName?: string
  resumeFileData?: string   // base64-encoded original file
  resumeFileMime?: string   // MIME type of original file
  settingsVersion?: number
}

// ─── AI scan result ───────────────────────────────────────────
export interface ScanResult {
  recipientEmail: string
  recipientName: string
  jobPositions: JobPosition[]
  bestMatch: JobPosition | null
  outreachEmail: OutreachEmail
}

export interface JobPosition {
  title: string
  qualifications: string[]
  matchScore?: number
  matchReasons?: string[]
}

export interface OutreachEmail {
  subject: string
  body: string
}