export interface StackFrame {
  file: string | null
  line: number | null
  column: number | null
  functionName: string | null
  raw: string
}

export interface ParsedStackTrace {
  exceptionType: string | null
  exceptionMessage: string | null
  language: string | null
  frames: StackFrame[]
}

// Patterns for different runtimes
const PATTERNS = {
  // JavaScript/Node: "  at functionName (file.js:10:5)"
  // or              "  at file.js:10:5"
  javascript: {
    frame: /^\s+at\s+(?:(.+?)\s+\()?(.+?):(\d+)(?::(\d+))?\)?$/,
    exception: /^([A-Za-z][A-Za-z0-9]*(?:Error|Exception|Fault|Warning)?)(?::\s*(.+))?$/,
  },
  // Python: '  File "file.py", line 10, in function_name'
  python: {
    frame: /^\s+File "(.+?)", line (\d+), in (.+)$/,
    exception: /^([A-Za-z][A-Za-z0-9.]*(?:Error|Exception|Warning)?)(?::\s*(.+))?$/,
  },
  // Java: "  at com.example.Class.method(File.java:10)"
  java: {
    frame: /^\s+at\s+([\w$.]+)\(([\w$.]+\.java):(\d+)\)$/,
    exception: /^(?:[\w.]+\.)?([A-Za-z][A-Za-z0-9]*(?:Exception|Error))(?::\s*(.+))?$/,
  },
}

function detectLanguage(raw: string): 'javascript' | 'python' | 'java' | null {
  if (/^\s+at\s+.+\(.+\.js:\d+/m.test(raw)) return 'javascript'
  if (/^\s+at\s+.+\(.+\.ts:\d+/m.test(raw)) return 'javascript'
  if (/File ".+\.py", line \d+/m.test(raw)) return 'python'
  if (/^\s+at\s+[\w$.]+\([\w$.]+\.java:\d+\)/m.test(raw)) return 'java'
  // Node without file extensions
  if (/^\s+at\s+/m.test(raw)) return 'javascript'
  return null
}

function parseJavaScriptTrace(lines: string[]): { frames: StackFrame[]; exception: { type: string | null; message: string | null } } {
  const frames: StackFrame[] = []
  let exceptionType: string | null = null
  let exceptionMessage: string | null = null

  for (const line of lines) {
    const frameMatch = line.match(PATTERNS.javascript.frame)
    if (frameMatch) {
      const [, functionName, file, lineNum, col] = frameMatch
      frames.push({
        functionName: functionName?.trim() || null,
        file: file?.trim() || null,
        line: lineNum ? parseInt(lineNum, 10) : null,
        column: col ? parseInt(col, 10) : null,
        raw: line.trim(),
      })
      continue
    }

    if (frames.length === 0) {
      const excMatch = line.match(PATTERNS.javascript.exception)
      if (excMatch) {
        exceptionType = excMatch[1] || null
        exceptionMessage = excMatch[2]?.trim() || null
      }
    }
  }

  return { frames, exception: { type: exceptionType, message: exceptionMessage } }
}

function parsePythonTrace(lines: string[]): { frames: StackFrame[]; exception: { type: string | null; message: string | null } } {
  const frames: StackFrame[] = []
  let exceptionType: string | null = null
  let exceptionMessage: string | null = null

  for (const line of lines) {
    const frameMatch = line.match(PATTERNS.python.frame)
    if (frameMatch) {
      const [, file, lineNum, functionName] = frameMatch
      frames.push({
        file: file || null,
        line: lineNum ? parseInt(lineNum, 10) : null,
        column: null,
        functionName: functionName?.trim() || null,
        raw: line.trim(),
      })
      continue
    }

    // Last non-empty line that matches exception pattern
    const excMatch = line.match(PATTERNS.python.exception)
    if (excMatch && !line.startsWith(' ')) {
      exceptionType = excMatch[1] || null
      exceptionMessage = excMatch[2]?.trim() || null
    }
  }

  return { frames, exception: { type: exceptionType, message: exceptionMessage } }
}

function parseJavaTrace(lines: string[]): { frames: StackFrame[]; exception: { type: string | null; message: string | null } } {
  const frames: StackFrame[] = []
  let exceptionType: string | null = null
  let exceptionMessage: string | null = null

  for (const line of lines) {
    const frameMatch = line.match(PATTERNS.java.frame)
    if (frameMatch) {
      const [, qualifiedMethod, file, lineNum] = frameMatch
      const parts = qualifiedMethod.split('.')
      const functionName = parts.slice(-2).join('.')
      frames.push({
        file: file || null,
        line: lineNum ? parseInt(lineNum, 10) : null,
        column: null,
        functionName,
        raw: line.trim(),
      })
      continue
    }

    if (frames.length === 0) {
      const excMatch = line.match(PATTERNS.java.exception)
      if (excMatch) {
        exceptionType = excMatch[1] || null
        exceptionMessage = excMatch[2]?.trim() || null
      }
    }
  }

  return { frames, exception: { type: exceptionType, message: exceptionMessage } }
}

export function parseStackTrace(raw: string): ParsedStackTrace {
  if (!raw || !raw.trim()) {
    return { exceptionType: null, exceptionMessage: null, language: null, frames: [] }
  }

  const language = detectLanguage(raw)
  const lines = raw.split('\n')

  let result: { frames: StackFrame[]; exception: { type: string | null; message: string | null } }

  switch (language) {
    case 'python':
      result = parsePythonTrace(lines)
      break
    case 'java':
      result = parseJavaTrace(lines)
      break
    case 'javascript':
    default:
      result = parseJavaScriptTrace(lines)
      break
  }

  return {
    exceptionType: result.exception.type,
    exceptionMessage: result.exception.message,
    language,
    frames: result.frames,
  }
}