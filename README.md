# Snap2Email — Job Scan

Drop a job posting screenshot. The AI reads it, matches your resume, and sends a tailored outreach email — all in one click.

## Features

- **Vision-based scanning** — Upload any screenshot of a job posting (JPEG/PNG). The AI extracts all text, including job titles, qualifications, and email addresses.
- **Resume matching** — Upload your resume (PDF/DOCX/TXT). The AI compares your skills against each job position and identifies the best fit.
- **Two modes**
  - **Scan & Send** — One click. Scans, generates, and sends the email immediately.
  - **Scan & Review** — Edits the recipient, subject, and body before sending.
- **Gmail integration** — Authenticate once via Google OAuth. Emails are sent directly from your inbox with your resume attached.
- **Privacy-first** — Your resume stays in your browser (IndexedDB). The AI API key lives on the server, never in the client bundle.
- **Archive theme** — Warm paper-and-ink interface. Stamps, paperclips, ruled lines, and folder-tab navigation.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19, TypeScript 6 |
| Build | Vite 8 |
| Styling | Tailwind 4 |
| Storage | Dexie (IndexedDB) |
| AI | OpenRouter (vision + reasoning models) |
| Email | Gmail REST API via Google Identity Services |
| API Proxy | Vercel serverless functions (Node.js 20) |
| Deployment | Vercel |

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- A Google Cloud project with the Gmail API enabled
- An OpenRouter API key (or any OpenAI-compatible API)

### Installation

```bash
git clone <repo-url>
cd batch-mailer
npm install
```

### Configuration

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

| Variable | Required | Description |
|---|---|---|
| `VITE_GMAIL_CLIENT_ID` | Yes | OAuth client ID from Google Cloud Console (web application type) |
| `VITE_AI_API_KEY` | Yes | OpenRouter API key (or compatible provider) |
| `VITE_AI_BASE_URL` | No | Defaults to `https://openrouter.ai/api/v1` |
| `VITE_AI_VISION_MODEL` | No | Vision model for text extraction (default: `openai/gpt-4o-mini`) |
| `VITE_AI_REASONING_MODEL` | No | Reasoning model for email generation (default: `openai/gpt-4o`) |

### Development

Starts both the Vite dev server and the API proxy server:

```bash
npm run dev
```

- Frontend: http://localhost:5173
- API proxy: http://localhost:3001

The Vite dev server proxies `/api/*` requests to the local API server.

### Build

```bash
npm run build
```

Output goes to `dist/`.

## Deployment

### Vercel (recommended)

The project includes Vercel serverless functions in `api/` that handle AI API proxying — no separate server needed.

1. Push to GitHub
2. Connect the repo in Vercel
3. Add the environment variables (same as `.env`) in Vercel project settings
4. Deploy

The `vercel.json` configuration handles:
- CSP headers for security
- SPA rewrites for client-side routing
- Node.js 20 runtime for serverless functions

## Architecture

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────┐
│   Browser    │────▶│  Vercel Functions │────▶│  OpenRouter  │
│  (React SPA) │     │  (api/*.js)       │     │  (AI API)    │
│              │     │                   │     │              │
│  Dexie (DB)  │     │  /api/health      │     │  Vision      │
│  GIS (OAuth) │     │  /api/chat/       │     │  Reasoning   │
│              │     │    completions     │     │              │
└──────┬───────┘     └──────────────────┘     └──────────────┘
       │
       ▼
┌──────────────┐
│  Gmail API   │
│  (send email) │
└──────────────┘
```

### Two-stage AI pipeline

1. **Vision** — The screenshot is sent to a cheap vision model (`gpt-4o-mini`) to extract all text content.
2. **Reasoning** — The extracted text plus the user's resume is sent to a more capable model (`gpt-4o`) to identify job positions, match skills, and generate a tailored outreach email.

### API proxy

The AI API key is stored server-side. The frontend calls `/api/chat/completions` which proxies to OpenRouter. This keeps the key out of the client bundle.

## Project Structure

```
batch-mailer/
├── api/                    # Vercel serverless functions
│   ├── health.js           # Health check endpoint
│   └── chat/
│       └── completions.js  # AI chat completions proxy
├── server/
│   └── server.js           # Local dev API proxy server
├── src/
│   ├── lib/
│   │   ├── ai.ts           # AI API client
│   │   ├── db.ts           # IndexedDB (Dexie) schema + settings
│   │   ├── gmail.ts        # Gmail OAuth + send
│   │   ├── resume.ts       # Resume parsing (PDF/DOCX/TXT)
│   │   └── types.ts        # TypeScript types
│   ├── pages/
│   │   ├── Landing.tsx     # About / landing page
│   │   ├── Scan.tsx        # Main scan page
│   │   ├── Settings.tsx    # Settings page
│   │   └── NotFound.tsx    # 404 page
│   ├── App.tsx             # App shell with folder tabs
│   ├── index.css           # Archive theme styles
│   └── main.tsx            # Entry point
├── index.html
├── vercel.json
├── vite.config.ts
└── .env.example
```

## License

MIT