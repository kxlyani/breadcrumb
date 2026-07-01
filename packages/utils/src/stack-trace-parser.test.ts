import { describe, it, expect } from 'vitest'
import { parseStackTrace } from './stack-trace-parser'

describe('parseStackTrace', () => {
  it('parses a JavaScript/Node stack trace', () => {
    const raw = `TypeError: Cannot read properties of undefined (reading 'id')
    at getUserById (src/services/user.service.ts:42:18)
    at async handler (src/routes/user.routes.ts:15:20)`

    const result = parseStackTrace(raw)

    expect(result.language).toBe('javascript')
    expect(result.exceptionType).toBe('TypeError')
    expect(result.exceptionMessage).toBe("Cannot read properties of undefined (reading 'id')")
    expect(result.frames).toHaveLength(2)
    expect(result.frames[0].functionName).toBe('getUserById')
    expect(result.frames[0].file).toBe('src/services/user.service.ts')
    expect(result.frames[0].line).toBe(42)
  })

  it('parses a Python stack trace', () => {
    const raw = `Traceback (most recent call last):
  File "app/services/auth.py", line 34, in verify_token
    payload = jwt.decode(token, SECRET)
KeyError: 'user_id'`

    const result = parseStackTrace(raw)

    expect(result.language).toBe('python')
    expect(result.exceptionType).toBe('KeyError')
    expect(result.frames[0].file).toBe('app/services/auth.py')
    expect(result.frames[0].line).toBe(34)
  })

  it('returns empty result for empty input', () => {
    const result = parseStackTrace('')
    expect(result.frames).toHaveLength(0)
    expect(result.language).toBeNull()
  })
})