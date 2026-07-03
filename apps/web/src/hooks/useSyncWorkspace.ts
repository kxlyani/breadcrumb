import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { workspacesApi } from '@breadcrumb/api-client'
import { useWorkspaceStore } from '@/store/workspace.store'

export function useSyncWorkspace() {
  const { workspaceId } = useParams<{ workspaceId: string }>()
  const setWorkspaces = useWorkspaceStore((s) => s.setWorkspaces)
  const setActiveWorkspace = useWorkspaceStore((s) => s.setActiveWorkspace)
  const [syncing, setSyncing] = useState(false)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!workspaceId) return

    let cancelled = false

    const sync = async () => {
      setSyncing(true)
      setNotFound(false)
      try {
        let list = useWorkspaceStore.getState().workspaces
        if (!list.some((w) => w.id === workspaceId)) {
          list = await workspacesApi.list()
          if (!cancelled) setWorkspaces(list)
        }

        const ws = list.find((w) => w.id === workspaceId)
        if (cancelled) return

        if (ws) {
          const current = useWorkspaceStore.getState().activeWorkspace
          if (current?.id !== ws.id) setActiveWorkspace(ws)
          setNotFound(false)
        } else {
          setNotFound(true)
        }
      } catch {
        if (!cancelled) setNotFound(true)
      } finally {
        if (!cancelled) setSyncing(false)
      }
    }

    sync()
    return () => {
      cancelled = true
    }
  }, [workspaceId, setWorkspaces, setActiveWorkspace])

  return { workspaceId, syncing, notFound }
}
