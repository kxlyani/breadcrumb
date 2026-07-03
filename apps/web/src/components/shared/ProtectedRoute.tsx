import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token)
  const [hydrated, setHydrated] = useState(() => useAuthStore.persist.hasHydrated())

  useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) {
      setHydrated(true)
      return
    }
    return useAuthStore.persist.onFinishHydration(() => setHydrated(true))
  }, [])

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0e0f0d]">
        <p className="text-[12px] text-[#4f554d]">Loading…</p>
      </div>
    )
  }

  if (!token) return <Navigate to="/login" replace />
  return <>{children}</>
}
