export interface RegisterInput {
  email: string
  name?: string
  password: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  user: {
    id: string
    email: string
    name: string | null
  }
}