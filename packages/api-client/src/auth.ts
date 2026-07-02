import { httpClient } from './client'

export interface User {
  id: string
  email: string
  name: string | null
}

export interface AuthResponse {
  token: string
  user: User
}

export const authApi = {
  register: async (data: { email: string; password: string; name?: string }) => {
    const res = await httpClient.post<{ success: true; data: AuthResponse }>('/auth/register', data)
    return res.data.data
  },

  login: async (data: { email: string; password: string }) => {
    const res = await httpClient.post<{ success: true; data: AuthResponse }>('/auth/login', data)
    return res.data.data
  },

  me: async () => {
    const res = await httpClient.get<{ success: true; data: { user: User } }>('/auth/me')
    return res.data.data.user
  },
}