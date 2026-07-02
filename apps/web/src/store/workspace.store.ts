import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Workspace } from '@breadcrumb/api-client'

interface WorkspaceState {
  workspaces: Workspace[]
  activeWorkspace: Workspace | null
  setWorkspaces: (workspaces: Workspace[]) => void
  setActiveWorkspace: (workspace: Workspace) => void
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      workspaces: [],
      activeWorkspace: null,
      setWorkspaces: (workspaces) => set({ workspaces }),
      setActiveWorkspace: (workspace) => set({ activeWorkspace: workspace }),
    }),
    { name: 'breadcrumb-workspace' }
  )
)