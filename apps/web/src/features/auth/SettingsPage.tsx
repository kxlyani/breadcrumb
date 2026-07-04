import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { httpClient } from '@breadcrumb/api-client'

export function SettingsPage() {
  const [token, setToken]     = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied]   = useState(false)

  const generateToken = async () => {
    setLoading(true)
    try {
      const res = await httpClient.post<{
        success: true
        data: { token: string; note: string }
      }>('/auth/tokens')
      setToken(res.data.data.token)
    } catch (err: any) {
      console.error('Failed to generate token:', err.message)
    } finally {
      setLoading(false)
    }
  }

  const copyToken = () => {
    if (!token) return
    navigator.clipboard.writeText(token)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-[#0e0f0d]">
      <div className="max-w-[520px]">
        <h1 className="text-[18px] font-semibold tracking-tight text-[#ede8e3] mb-1">
          Settings
        </h1>
        <p className="text-[12.5px] text-[#4f554d] mb-8">
          Manage your account and API access.
        </p>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[10.5px] font-semibold uppercase tracking-[0.09em] text-[#4f554d]">
              API tokens
            </span>
            <div className="flex-1 h-px bg-[#1f221e]" />
          </div>

          <p className="text-[12.5px] text-[#a8a89e] mb-4">
            Use an API token to authenticate the Breadcrumb CLI.
          </p>

          {token ? (
            <div className="rounded-lg border border-[rgba(213,149,126,0.25)] bg-[rgba(213,149,126,0.06)] p-4 mb-3">
              <p className="text-[10.5px] text-[#D5957E] font-medium mb-2">
                Token generated — copy it now, it won't be shown again
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 font-mono text-[11px] text-[#ede8e3] bg-[#141714] border border-[#2a2f28] rounded px-3 py-2 break-all">
                  {token}
                </code>
                <Button size="sm" variant="ghost" onClick={copyToken}>
                  {copied ? '✓ Copied' : 'Copy'}
                </Button>
              </div>
              <div className="mt-4 rounded-md bg-[#141714] border border-[#2a2f28] p-3">
                <p className="text-[11px] text-[#4f554d] font-mono mb-1">Run in your terminal:</p>
                <code className="text-[11px] text-[#a8a89e] font-mono break-all">
                  breadcrumb login --token {token}
                </code>
              </div>
            </div>
          ) : (
            <Button onClick={generateToken} loading={loading} variant="ghost">
              Generate API token
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}