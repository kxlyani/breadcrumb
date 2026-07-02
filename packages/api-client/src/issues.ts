import { httpClient } from './client'

export interface StackTrace {
  raw: string
  exceptionType: string | null
  exceptionMessage: string | null
  language: string | null
  frames: Array<{
    file: string | null
    line: number | null
    functionName: string | null
    raw: string
  }>
}

export interface IssueNote {
  id: string
  content: string
  createdAt: string
}

export interface Issue {
  id: string
  title: string
  description: string | null
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED'
  createdAt: string
  updatedAt: string
  resolvedAt: string | null
  stackTrace: StackTrace | null
  rootCause: { description: string; identifiedAt: string } | null
  fix: {
    description: string
    approach: string
    affectedFiles: string[]
    commitRef: string | null
  } | null
  notes: IssueNote[]
  tags: Array<{ id: string; name: string; color: string }>
}

export interface IssueListItem {
  id: string
  title: string
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED'
  updatedAt: string
  exceptionType: string | null
  language: string | null
  noteCount: number
  tags: Array<{ id: string; name: string; color: string }>
}

export const issuesApi = {
  create: async (workspaceId: string, data: {
    title: string
    description?: string
    stackTrace?: string
  }) => {
    const res = await httpClient.post<{ success: true; data: Issue }>(
      `/workspaces/${workspaceId}/issues`, data
    )
    return res.data.data
  },

  list: async (workspaceId: string, params?: { status?: string; page?: number }) => {
    const res = await httpClient.get<{
      success: true
      data: IssueListItem[]
      pagination: { total: number; page: number; pageSize: number; hasMore: boolean }
    }>(`/workspaces/${workspaceId}/issues`, { params })
    return res.data
  },

  getById: async (workspaceId: string, issueId: string) => {
    const res = await httpClient.get<{ success: true; data: Issue }>(
      `/workspaces/${workspaceId}/issues/${issueId}`
    )
    return res.data.data
  },

  search: async (workspaceId: string, q: string) => {
    const res = await httpClient.get<{ success: true; data: IssueListItem[] }>(
      `/workspaces/${workspaceId}/issues/search`, { params: { q } }
    )
    return res.data.data
  },

  addNote: async (workspaceId: string, issueId: string, content: string) => {
    const res = await httpClient.post<{ success: true; data: IssueNote }>(
      `/workspaces/${workspaceId}/issues/${issueId}/notes`, { content }
    )
    return res.data.data
  },

  setRootCause: async (workspaceId: string, issueId: string, description: string) => {
    const res = await httpClient.put(
      `/workspaces/${workspaceId}/issues/${issueId}/root-cause`, { description }
    )
    return res.data.data
  },

  recordFix: async (workspaceId: string, issueId: string, data: {
    description: string
    approach: string
    affectedFiles: string[]
    commitRef?: string
  }) => {
    const res = await httpClient.put(
      `/workspaces/${workspaceId}/issues/${issueId}/fix`, data
    )
    return res.data.data
  },

  updateStatus: async (workspaceId: string, issueId: string, status: string) => {
    const res = await httpClient.patch(
      `/workspaces/${workspaceId}/issues/${issueId}/status`, { status }
    )
    return res.data.data
  },
}