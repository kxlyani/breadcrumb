import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import { useWorkspaceStore } from '@/store/workspace.store'

export function AppLayout() {
  const { user, clearAuth } = useAuthStore()
  const { activeWorkspace } = useWorkspaceStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
  }

  const navLink = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
      isActive
        ? 'bg-indigo-500/10 text-indigo-400'
        : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
    }`

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f1117]">
      {/* Sidebar */}
      <aside className="flex w-56 flex-col border-r border-white/5 bg-[#1a1d27] p-4">
        <div className="mb-6 px-3">
          <span className="text-base font-semibold text-slate-100">Breadcrumb</span>
          {activeWorkspace && (
            <p className="mt-0.5 truncate text-xs text-slate-500">{activeWorkspace.name}</p>
          )}
        </div>

        <nav className="flex flex-col gap-1">
          <NavLink to="/dashboard" className={navLink}>Dashboard</NavLink>
          {activeWorkspace && (
            <>
              <NavLink to={`/workspaces/${activeWorkspace.id}/issues`} className={navLink}>
                Issues
              </NavLink>
            </>
          )}
          <NavLink to="/workspaces" className={navLink}>Workspaces</NavLink>
        </nav>

        <div className="mt-auto border-t border-white/5 pt-4">
          <div className="mb-2 px-3">
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-colors"
          >
            Log out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}