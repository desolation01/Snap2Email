/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GMAIL_CLIENT_ID: string
  readonly VITE_AI_BASE_URL: string
  readonly VITE_AI_API_KEY: string
  readonly VITE_AI_VISION_MODEL: string
  readonly VITE_AI_REASONING_MODEL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}