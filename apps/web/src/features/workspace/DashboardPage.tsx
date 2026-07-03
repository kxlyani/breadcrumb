import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { workspacesApi, type Workspace } from '@breadcrumb/api-client'
import { useWorkspaceStore } from '@/store/workspace.store'
import { Button } from '@/components/ui/Button'
import { ErrorRetry } from '@/components/ui/ErrorRetry'

export function DashboardPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { setWorkspaces: storeSet, setActiveWorkspace } = useWorkspaceStore()
  const navigate = useNavigate()

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    workspacesApi
      .list()
      .then((data) => {
        setWorkspaces(data)
        storeSet(data)
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to load workspaces.')
        setLoading(false)
      })
  }, [storeSet])

  useEffect(() => {
    load()
  }, [load])

  const handleSelect = (ws: Workspace) => {
    setActiveWorkspace(ws)
    navigate(`/workspaces/${ws.id}/issues`)
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#0e0f0d] p-8">
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-[5px]">
          <div className="h-[5px] w-[5px] rounded-full bg-[#D5957E]" />
          <div className="h-[3px] w-[3px] rounded-full bg-[#D5957E] opacity-50" />
          <div className="h-[2px] w-[2px] rounded-full bg-[#D5957E] opacity-25" />
          <span className="ml-1 text-[10.5px] font-medium uppercase tracking-[0.08em] text-[#D5957E]">
            Breadcrumb
          </span>
        </div>
        <h1 className="text-[20px] font-semibold tracking-tight text-[#ede8e3]">Your workspaces</h1>
        <p className="mt-1 text-[12.5px] text-[#4f554d]">
          Select a workspace to track and investigate issues
        </p>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <span className="text-[10.5px] font-medium uppercase tracking-[0.08em] text-[#4f554d]">
          {loading ? '—' : `${workspaces.length} workspace${workspaces.length !== 1 ? 's' : ''}`}
        </span>
        <Button size="sm" onClick={() => navigate('/workspaces/new')}>
          + New workspace
        </Button>
      </div>

      {loading ? (
        <p className="text-[12px] text-[#4f554d]">Loading…</p>
      ) : error ? (
        <ErrorRetry message={error} onRetry={load} />
      ) : workspaces.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[#2a2f28] p-12 text-center">
          <p className="mb-4 text-[13px] text-[#4f554d]">No workspaces yet.</p>
          <Button onClick={() => navigate('/workspaces/new')}>Create your first workspace</Button>
        </div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((ws) => (
            <button
              key={ws.id}
              onClick={() => handleSelect(ws)}
              className="group rounded-lg border border-[#1f221e] bg-[#141714] p-5 text-left transition-all hover:border-[rgba(213,149,126,0.3)] hover:bg-[#1a1e19]"
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-[3px]">
                  <div className="h-[6px] w-[6px] rounded-full bg-[#D5957E] opacity-60 transition-opacity group-hover:opacity-100" />
                  <div className="h-[3.5px] w-[3.5px] rounded-full bg-[#D5957E] opacity-30 transition-opacity group-hover:opacity-60" />
                  <div className="h-[2px] w-[2px] rounded-full bg-[#D5957E] opacity-15 transition-opacity group-hover:opacity-30" />
                </div>
                <span className="text-[10px] uppercase tracking-wider text-[#4f554d] capitalize">
                  {ws.role}
                </span>
              </div>
              <p className="mb-1 text-[13.5px] font-medium text-[#ede8e3]">{ws.name}</p>
              <p className="text-[11px] text-[#4f554d]">{ws.slug}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
