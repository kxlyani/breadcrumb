import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { workspacesApi, type Workspace } from '@breadcrumb/api-client'
import { useWorkspaceStore } from '@/store/workspace.store'
import { Button } from '@/components/ui/Button'

export function DashboardPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [loading, setLoading] = useState(true)
  const { setWorkspaces: storeSet, setActiveWorkspace } = useWorkspaceStore()
  const navigate = useNavigate()

  useEffect(() => {
    workspacesApi.list().then((data) => {
      setWorkspaces(data)
      storeSet(data)
      setLoading(false)
    })
  }, [])

  const handleSelect = (ws: Workspace) => {
    setActiveWorkspace(ws)
    navigate(`/workspaces/${ws.id}/issues`)
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Select a workspace to continue</p>
        </div>
        <Button onClick={() => navigate('/workspaces/new')}>New Workspace</Button>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : workspaces.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 p-12 text-center">
          <p className="text-slate-500">No workspaces yet.</p>
          <Button className="mt-4" onClick={() => navigate('/workspaces/new')}>
            Create your first workspace
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((ws) => (
            <button
              key={ws.id}
              onClick={() => handleSelect(ws)}
              className="rounded-xl border border-white/10 bg-[#1a1d27] p-5 text-left transition-colors hover:border-indigo-500/50 hover:bg-[#21253a]"
            >
              <p className="font-medium text-slate-100">{ws.name}</p>
              <p className="mt-1 text-xs text-slate-500 capitalize">{ws.role}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}