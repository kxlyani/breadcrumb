import { httpClient } from './client'

export interface Workspace {
  id: string
  name: string
  slug: string
  role: string
  createdAt: string
}

export const workspacesApi = {
  create: async (data: { name: string }) => {
    const res = await httpClient.post<{ success: true; data: Workspace }>('/workspaces', data)
    return res.data.data
  },

  list: async () => {
    const res = await httpClient.get<{ success: true; data: Workspace[] }>('/workspaces')
    return res.data.data
  },

  getById: async (id: string) => {
    const res = await httpClient.get<{ success: true; data: Workspace }>(`/workspaces/${id}`)
    return res.data.data
  },
}