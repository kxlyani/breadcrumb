import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { issuesApi } from '@breadcrumb/api-client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export function NewIssuePage() {
  const { workspaceId } = useParams<{ workspaceId: string }>()
  const navigate = useNavigate()
  const [form, setForm]     = useState({ title: '', description: '', stackTrace: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const set = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((p) => ({ ...p, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!workspaceId) return
    setLoading(true)
    try {
      const issue = await issuesApi.create(workspaceId, {
        title:       form.title,
        description: form.description || undefined,
        stackTrace:  form.stackTrace  || undefined,
      })
      navigate(`/workspaces/${workspaceId}/issues/${issue.id}`)
    } catch (err: any) {
      setError(err.response?.data?.error?.message ?? 'Failed to create issue')
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#0e0f0d] p-8">
      <div className="max-w-[560px] mx-auto">
        <div className="mb-6">
          <h1 className="text-[18px] font-semibold tracking-tight text-[#ede8e3] mb-1">
            New issue
          </h1>
          <p className="text-[12.5px] text-[#4f554d]">
            Capture the error while it's fresh. You can add root cause and fix later.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {error && (
            <p className="text-[12px] text-[#d9876e]">{error}</p>
          )}

          <Input
            label="Title"
            value={form.title}
            onChange={set('title')}
            placeholder="What went wrong?"
            required
            autoFocus
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium uppercase tracking-widest text-[#4f554d]">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={set('description')}
              placeholder="What were you doing when this happened?"
              rows={3}
              className="w-full rounded-md bg-[#141714] border border-[#2a2f28] px-3 py-2 text-[12.5px] text-[#a8a89e] outline-none resize-none focus:border-[rgba(213,149,126,0.4)] placeholder-[#4f554d]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium uppercase tracking-widest text-[#4f554d]">
              Stack trace
              <span className="ml-2 normal-case tracking-normal text-[#4f554d] opacity-60">
                — parsed automatically
              </span>
            </label>
            <textarea
              value={form.stackTrace}
              onChange={set('stackTrace')}
              placeholder="Paste your stack trace here…"
              rows={8}
              className="w-full rounded-md bg-[#141714] border border-[#2a2f28] px-3 py-2 font-mono text-[11.5px] text-[#a8a89e] outline-none resize-none focus:border-[rgba(213,149,126,0.4)] placeholder-[#4f554d]"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" loading={loading} className="flex-1 justify-center">
              Create issue
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}