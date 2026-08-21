import Dexie from 'dexie'
import type { AppSettings } from './types'

export interface SendLog {
  id: string
  timestamp: number
  recipient: string
  subject: string
  status: 'sent' | 'failed'
  error?: string
}

export class BatchMailerDB extends Dexie {
  settings!: Dexie.Table<AppSettings, string>
  sendLogs!: Dexie.Table<SendLog, string>

  constructor() {
    super('snap2email')
    this.version(1).stores({
      settings: 'id',
    })
    this.version(2).stores({
      settings: 'id',
      sendLogs: 'id, timestamp, recipient, status',
    })
  }
}

export const db = new BatchMailerDB()

// Request persistent storage so IndexedDB data survives low-storage conditions
if (navigator.storage?.persist) {
  navigator.storage.persist().catch(() => {})
}

// ─── Default settings ─────────────────────────────────────────
const DEFAULT_INSTRUCTIONS = `You are a job application assistant. From the image, extract the recruiter or hiring contact's name and email exactly as shown; never guess, infer, or construct an email address that isn't literally visible, and if none appears, say so instead of inventing one. If no name is visible, address the email to "Hiring Manager." From the positions listed in the posting, choose the one the candidate is genuinely qualified for using ONLY the evidence in their resume; never pick a role whose stated requirements exceed what the resume demonstrates. If the candidate isn't a genuine match for any listed position, say so plainly instead of forcing an email.

Write a warm, specific outreach email grounded strictly in real resume content: every skill, tool, employer, project, and achievement you mention must appear in the resume, and you must never fabricate or overstate qualifications. Structure it as one sentence referencing a real detail from the posting, one concrete achievement from the resume that maps to the role, a brief line connecting the two, and a single low-friction ask, such as a short call. Avoid em-dashes, avoid generic phrases like "passionate about," "perfect fit," "hit the ground running," or "circle back," and make it sound like a real person wrote it, not a template. No subject line inside the body, no placeholders. Sign off with the candidate's name and whatever contact details (phone, LinkedIn, portfolio) actually appear on their resume, omitting anything that isn't there rather than leaving a blank.

Keep the email body under 150 words total including the signature, and no shorter than 60; trim content before trimming the ask. Return exactly these fields, plain text, clearly labeled, no JSON and no extra commentary: Recruiter Name, Recruiter Email, Positions Found, Chosen Role, Subject, Email Body.`

const SETTINGS_VERSION = 5

const DEFAULT_SETTINGS: AppSettings = {
  id: 'default',
  aiInstructions: DEFAULT_INSTRUCTIONS,
  senderName: '',
  senderEmail: '',
  portfolioUrl: '',
  isGraduated: true,
  settingsVersion: SETTINGS_VERSION,
}

export async function getSettings(): Promise<AppSettings> {
  const settings = await db.settings.get('default')
  if (settings) {
    // If stored version is stale or instructions are empty, migrate and persist
    if (!settings.aiInstructions || settings.settingsVersion !== SETTINGS_VERSION) {
      settings.aiInstructions = DEFAULT_INSTRUCTIONS
      settings.settingsVersion = SETTINGS_VERSION
      await db.settings.put(settings)
    }
    return settings
  }

  await db.settings.put(DEFAULT_SETTINGS)
  return DEFAULT_SETTINGS
}

export async function saveSettings(partial: Partial<AppSettings>): Promise<AppSettings> {
  const current = await getSettings()
  const updated = { ...current, ...partial, id: 'default', settingsVersion: SETTINGS_VERSION }
  await db.settings.put(updated)
  return updated
}

export function genId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}