import axios from 'axios'
import type { BreadcrumbConfig } from './config'

export function createApiClient(config: BreadcrumbConfig) {
  const client = axios.create({
    baseURL: `${config.apiUrl}/api/v1`,
    headers: {
      Authorization: `Bearer ${config.token}`,
      'Content-Type': 'application/json',
      'X-Client-Type': 'cli',
    },
  })

  return {
    // Auth
    async me() {
      const res = await client.get('/auth/me')
      return res.data.data.user
    },

    // Workspaces
    async listWorkspaces() {
      const res = await client.get('/workspaces')
      return res.data.data as Array<{
        id: string
        name: string
        slug: string
        role: string
      }>
    },

    // Issues
    async createIssue(data: {
      title: string
      description?: string
      stackTrace?: string
    }) {
      const res = await client.post(
        `/workspaces/${config.workspaceId}/issues`,
        data
      )
      return res.data.data
    },

    async listIssues(params?: { status?: string }) {
      const res = await client.get(
        `/workspaces/${config.workspaceId}/issues`,
        { params }
      )
      return res.data
    },

    async searchIssues(q: string) {
      const res = await client.get(
        `/workspaces/${config.workspaceId}/issues/search`,
        { params: { q } }
      )
      return res.data.data as Array<{
        id: string
        title: string
        status: string
        exceptionType: string | null
        updatedAt: string
      }>
    },
  }
}