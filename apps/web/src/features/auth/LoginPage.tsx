import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '@breadcrumb/api-client'
import { useAuthStore } from '@/store/auth.store'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const { setAuth }             = useAuthStore()
  const navigate                = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { token, user } = await authApi.login({ email, password })
      setAuth(token, user)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.error?.message ?? 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0e0f0d] p-4">
      <div className="w-full max-w-[360px]">

        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex items-center gap-[4px]">
            <div className="w-[9px] h-[9px] rounded-full bg-[#D5957E]" />
            <div className="w-[5px] h-[5px] rounded-full bg-[#D5957E] opacity-50" />
            <div className="w-[3px]  h-[3px]  rounded-full bg-[#D5957E] opacity-25" />
          </div>
          <div className="text-[22px] font-semibold tracking-tight text-[#ede8e3]">
            bread<span className="text-[#D5957E]">crumb</span>
          </div>
          <p className="text-[12px] text-[#4f554d]">Sign in to continue</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-lg border border-[#1f221e] bg-[#141714] p-6"
        >
          {error && (
            <div className="rounded-md bg-[rgba(217,135,110,0.08)] border border-[rgba(217,135,110,0.2)] px-3 py-2 text-[12px] text-[#d9876e]">
              {error}
            </div>
          )}
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoFocus
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
          <Button type="submit" loading={loading} className="mt-1 w-full justify-center">
            Sign in
          </Button>
        </form>

        <p className="mt-4 text-center text-[12px] text-[#4f554d]">
          No account?{' '}
          <Link to="/register" className="text-[#D5957E] hover:opacity-80 transition-opacity">
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}