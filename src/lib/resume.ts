// ─── Resume Parser ────────────────────────────────────────────
// Converts PDF, DOCX, and TXT files to Markdown so the AI can
// understand the user's background and tailor responses.

import * as pdfjsLib from 'pdfjs-dist'

// Set the worker (required for pdfjs)
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

/**
 * Parse a resume file and return its content as Markdown.
 * Supports PDF, DOCX, and plain text files.
 */
export async function parseResumeToMarkdown(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase()

  switch (ext) {
    case 'pdf':
      return parsePdf(file)
    case 'docx':
      return parseDocx(file)
    case 'txt':
      return parseTxt(file)
    default:
      throw new Error(`Unsupported file format: .${ext}. Please upload a PDF, DOCX, or TXT file.`)
  }
}

/**
 * Extract text from a PDF using pdfjs-dist.
 */
async function parsePdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

  const pages: string[] = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const textContent = await page.getTextContent()
    const text = textContent.items
      .map((item: any) => item.str)
      .join(' ')
    pages.push(text)
  }

  const raw = pages.join('\n\n---\n\n')

  // Basic cleanup: normalize whitespace, collapse multiple newlines
  return raw
    .replace(/\s+/g, ' ')
    .replace(/\. /g, '.\n')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .join('\n\n')
}

/**
 * Convert DOCX to Markdown via mammoth → turndown.
 */
async function parseDocx(file: File): Promise<string> {
  const mammoth = await import('mammoth')
  const Turndown = (await import('turndown')).default

  const arrayBuffer = await file.arrayBuffer()
  const result = await mammoth.convertToHtml({ arrayBuffer })

  const turndown = new Turndown({
    headingStyle: 'atx',
    bulletListMarker: '-',
    codeBlockStyle: 'fenced',
  })

  const markdown = turndown.turndown(result.value)
  return markdown
}

/**
 * Read a plain text file.
 */
async function parseTxt(file: File): Promise<string> {
  return await file.text()
}

/**
 * Get a human-readable file size string.
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}