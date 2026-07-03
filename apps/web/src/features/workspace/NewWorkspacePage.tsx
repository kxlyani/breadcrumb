import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { workspacesApi } from '@breadcrumb/api-client'
import { useWorkspaceStore } from '@/store/workspace.store'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export function NewWorkspacePage() {
  const [name, setName]       = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
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
    <div className="flex min-h-full items-center justify-center p-8 bg-[#0e0f0d]">
      <div className="w-full max-w-[400px]">
        <h1 className="mb-1 text-[18px] font-semibold tracking-tight text-[#ede8e3]">
          New workspace
        </h1>
        <p className="mb-6 text-[12.5px] text-[#4f554d]">
          A workspace groups your issues and investigation history together.
        </p>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-lg border border-[#1f221e] bg-[#141714] p-6"
        >
          {error && (
            <p className="text-[12px] text-[#d9876e]">{error}</p>
          )}
          <Input
            label="Workspace name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. My API, Client Project, Side Hustle"
            required
            autoFocus
          />
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" loading={loading} className="flex-1 justify-center">
              Create workspace
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}