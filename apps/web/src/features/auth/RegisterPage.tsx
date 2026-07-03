import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '@breadcrumb/api-client'
import { useAuthStore } from '@/store/auth.store'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

type FieldErrors = Partial<Record<'email' | 'password' | 'name', string>>

function mapApiFieldErrors(details: unknown): FieldErrors {
  if (!details || typeof details !== 'object') return {}
  const mapped: FieldErrors = {}
  for (const [key, value] of Object.entries(details)) {
    if (Array.isArray(value) && value[0]) {
      mapped[key as keyof FieldErrors] = String(value[0])
    }
  }
  return mapped
}

export function RegisterPage() {
  const [form, setForm] = useState({ email: '', password: '', name: '' })
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    if (form.password.length < 8) {
      setFieldErrors({ password: 'Password must be at least 8 characters' })
      return
    }

    setLoading(true)
    try {
      const payload: { email: string; password: string; name?: string } = {
        email: form.email,
        password: form.password,
      }
      if (form.name.trim()) payload.name = form.name.trim()

      const { token, user } = await authApi.register(payload)
      setAuth(token, user)
      navigate('/dashboard')
    } catch (err: any) {
      const apiError = err.response?.data?.error
      setError(apiError?.message ?? 'Registration failed')
      setFieldErrors(mapApiFieldErrors(apiError?.details))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0e0f0d] p-4">
      <div className="w-full max-w-[360px]">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex items-center gap-[4px]">
            <div className="h-[9px] w-[9px] rounded-full bg-[#D5957E]" />
            <div className="h-[5px] w-[5px] rounded-full bg-[#D5957E] opacity-50" />
            <div className="h-[3px] w-[3px] rounded-full bg-[#D5957E] opacity-25" />
          </div>
          <div className="text-[22px] font-semibold tracking-tight text-[#ede8e3]">
            bread<span className="text-[#D5957E]">crumb</span>
          </div>
          <p className="text-[12px] text-[#4f554d]">Create your account</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-lg border border-[#1f221e] bg-[#141714] p-6"
        >
          {error && (
            <div className="rounded-md border border-[rgba(217,135,110,0.2)] bg-[rgba(217,135,110,0.08)] px-3 py-2 text-[12px] text-[#d9876e]">
              {error}
            </div>
          )}
          <Input
            label="Name"
            value={form.name}
            onChange={set('name')}
            placeholder="Optional"
            error={fieldErrors.name}
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={set('email')}
            placeholder="you@example.com"
            required
            error={fieldErrors.email}
          />
          <div className="flex flex-col gap-1.5">
            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={set('password')}
              placeholder="••••••••"
              required
              minLength={8}
              error={fieldErrors.password}
            />
            <p className="text-[11px] text-[#4f554d]">At least 8 characters</p>
          </div>
          <Button type="submit" loading={loading} className="mt-1 w-full justify-center">
            Create account
          </Button>
        </form>

        <p className="mt-4 text-center text-[12px] text-[#4f554d]">
          Already have an account?{' '}
          <Link to="/login" className="text-[#D5957E] transition-opacity hover:opacity-80">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
