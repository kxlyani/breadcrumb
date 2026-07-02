import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { issuesApi } from '@breadcrumb/api-client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export function NewIssuePage() {
  const { workspaceId } = useParams<{ workspaceId: string }>()
  const navigate = useNavigate()
  const [form, setForm] = useState({ title: '', description: '', stackTrace: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!workspaceId) return
    setLoading(true)
    try {
      const issue = await issuesApi.create(workspaceId, {
        title: form.title,
        description: form.description || undefined,
        stackTrace: form.stackTrace || undefined,
      })
      navigate(`/workspaces/${workspaceId}/issues/${issue.id}`)
    } catch (err: any) {
      setError(err.response?.data?.error?.message ?? 'Failed to create issue')
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl p-8">
      <h1 className="mb-6 text-xl font-semibold text-slate-100">New Issue</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {error && <p className="text-sm text-red-400">{error}</p>}

        <Input
          label="Title"
          value={form.title}
          onChange={set('title')}
          placeholder="What went wrong?"
          required
          autoFocus
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-300">Description</label>
          <textarea
            value={form.description}
            onChange={set('description')}
            placeholder="What were you doing when this happened?"
            rows={3}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-indigo-500 resize-none"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-300">
            Stack Trace
            <span className="ml-2 text-xs font-normal text-slate-500">optional — will be parsed automatically</span>
          </label>
          <textarea
            value={form.stackTrace}
            onChange={set('stackTrace')}
            placeholder="Paste your stack trace here..."
            rows={8}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-mono text-xs text-slate-300 placeholder-slate-500 outline-none focus:border-indigo-500 resize-none"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" loading={loading} className="flex-1">Create Issue</Button>
        </div>
      </form>
    </div>
  )
}