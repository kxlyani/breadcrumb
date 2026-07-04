import { parseStackTrace } from '@breadcrumb/utils'

export interface ExtractedError {
  title: string
  stackTrace: string | null
  raw: string
}

// Patterns that signal an error line worth using as a title
const ERROR_TITLE_PATTERNS = [
  /^([\w.]+(?:Error|Exception|Fault):\s*.+)$/m,
  /^error\s+TS\d+:\s*(.+)$/im,
  /^Error:\s*(.+)$/m,
  /^\s*✕\s*(.+)$/m,
  /^FAIL\s+(.+)$/m,
  /^error\[.+\]:\s*(.+)$/im,
]

export function extractError(output: string, command: string): ExtractedError {
  const raw = output.trim()

  // Try to find a clean title from the output
  let title: string | null = null

  for (const pattern of ERROR_TITLE_PATTERNS) {
    const match = raw.match(pattern)
    if (match) {
      title = (match[1] || match[0]).trim().slice(0, 150)
      break
    }
  }

  // Fall back to command-based title if nothing matched
  if (!title) {
    title = `${command} failed`
  }

  // Try to find a stack trace in the output
  const parsed = parseStackTrace(raw)
  const hasFrames = parsed.frames.length > 0

  return {
    title,
    stackTrace: hasFrames ? raw : null,
    raw,
  }
}

export function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours   = Math.floor(diff / 3600000)
  const days    = Math.floor(diff / 86400000)

  if (minutes < 1)  return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours   < 24) return `${hours}h ago`
  return `${days}d ago`
}