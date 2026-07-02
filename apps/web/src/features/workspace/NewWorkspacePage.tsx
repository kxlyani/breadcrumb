import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { workspacesApi } from '@breadcrumb/api-client'
import { useWorkspaceStore } from '@/store/workspace.store'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export function NewWorkspacePage() {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { setActiveWorkspace } = useWorkspaceStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const ws = await workspacesApi.create({ name })
      setActiveWorkspace(ws)
      navigate(`/workspaces/${ws.id}/issues`)
    } catch (err: any) {
      setError(err.response?.data?.error?.message ?? 'Failed to create workspace')
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-full items-center justify-center p-8">
      <div className="w-full max-w-md">
        <h1 className="mb-6 text-xl font-semibold text-slate-100">New Workspace</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-xl border border-white/10 bg-[#1a1d27] p-6">
          {error && <p className="text-sm text-red-400">{error}</p>}
          <Input label="Workspace name" value={name} onChange={(e) => setName(e.target.value)} placeholder="My Project" required autoFocus />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
            <Button type="submit" loading={loading} className="flex-1">Create Workspace</Button>
          </div>
        </form>
      </div>
    </div>
  )
}