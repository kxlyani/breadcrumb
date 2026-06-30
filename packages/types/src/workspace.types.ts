export interface CreateWorkspaceInput {
  name: string
}

export interface WorkspaceResponse {
  id: string
  name: string
  slug: string
  role: string
  createdAt: string
}