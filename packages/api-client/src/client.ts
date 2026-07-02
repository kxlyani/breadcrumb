import axios, { type AxiosInstance, type AxiosError } from 'axios'

export interface ApiSuccess<T> {
  success: true
  data: T
}

export interface ApiError {
  success: false
  error: { code: string; message: string; details?: unknown }
}

export type ApiResponse<T> = ApiSuccess<T>

function createClient(baseURL: string): AxiosInstance {
  const client = axios.create({ baseURL })

  // Attach token on every request
  client.interceptors.request.use((config) => {
    const token = localStorage.getItem('breadcrumb_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })

  // Normalize errors
  client.interceptors.response.use(
    (res) => res,
    (error: AxiosError<ApiError>) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('breadcrumb_token')
        window.location.href = '/login'
      }
      return Promise.reject(error)
    }
  )

  return client
}

export const httpClient = createClient('/api/v1')