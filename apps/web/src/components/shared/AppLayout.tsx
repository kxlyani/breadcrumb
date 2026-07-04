import { Outlet, NavLink, useNavigate, useParams } from 'react-router-dom'
import {
  LayoutDashboard,
  Flag,
  BookOpen,
  GitBranch,
  Sparkles,
  LogOut,
  Settings,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { useWorkspaceStore } from '@/store/workspace.store'

function NavItem({ to, icon: Icon, label }: { to: string; icon: LucideIcon; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `mb-[1px] flex items-center gap-2.5 rounded-md px-2 py-[6px] text-[12.5px] transition-all ${
          isActive
            ? 'bg-[rgba(213,149,126,0.10)] text-[#D5957E]'
            : 'text-[#4f554d] hover:bg-[#1f241e] hover:text-[#a8a89e]'
        }`
      }
    >
      <Icon className="h-[15px] w-[15px] shrink-0" aria-hidden />
      <span className="flex-1">{label}</span>
    </NavLink>
  )
}

export function AppLayout() {
  const { clearAuth } = useAuthStore()
  const { activeWorkspace } = useWorkspaceStore()
  const navigate = useNavigate()
  const params = useParams()

  const workspaceId = params.workspaceId ?? activeWorkspace?.id

  return (
    <div className="flex h-screen overflow-hidden bg-[#0e0f0d]">
      <aside className="flex w-[196px] min-w-[196px] flex-col border-r border-[#1f221e] bg-[#141714]">
        <div className="border-b border-[#1f221e] px-4 py-[18px]">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-[3px]">
              <div className="h-[7px] w-[7px] rounded-full bg-[#D5957E]" />
              <div className="h-[4px] w-[4px] rounded-full bg-[#D5957E] opacity-50" />
              <div className="h-[2.5px] w-[2.5px] rounded-full bg-[#D5957E] opacity-25" />
            </div>
            <span className="text-[14px] font-semibold tracking-tight text-[#ede8e3]">
              bread<span className="text-[#D5957E]">crumb</span>
            </span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-3">
          <div className="px-2 pb-1.5 pt-2 text-[9.5px] font-semibold uppercase tracking-[0.1em] text-[#4f554d]">
            Overview
          </div>
          <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />

          {workspaceId && (
            <>
              <div className="px-2 pb-1.5 pt-3 text-[9.5px] font-semibold uppercase tracking-[0.1em] text-[#4f554d]">
                Workspace
              </div>
              <NavItem to={`/workspaces/${workspaceId}/issues`} icon={Flag} label="Issues" />
              <NavItem
                to={`/workspaces/${workspaceId}/knowledge`}
                icon={BookOpen}
                label="Knowledge base"
              />
              <NavItem
                to={`/workspaces/${workspaceId}/repos`}
                icon={GitBranch}
                label="Repositories"
              />
            </>
          )}

          <div className="px-2 pb-1.5 pt-3 text-[9.5px] font-semibold uppercase tracking-[0.1em] text-[#4f554d]">
            Tools
          </div>
          <NavItem to="/assistant" icon={Sparkles} label="AI assistant" />
          <NavItem to="/settings" icon={Settings} label="Settings" />
        </nav>

        <div className="border-t border-[#1f221e] px-3 py-3">
          {activeWorkspace && (
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="mb-2 w-full cursor-pointer rounded-md border border-[#2a2f28] bg-[#1a1e19] px-3 py-2 text-left transition-colors hover:border-[#D5957E]/30"
            >
              <div className="mb-[2px] text-[9.5px] uppercase tracking-[0.05em] text-[#4f554d]">
                Workspace
              </div>
              <div className="truncate text-[12px] font-medium text-[#a8a89e]">
                {activeWorkspace.name}
              </div>
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              clearAuth()
              navigate('/login')
            }}
            aria-label="Log out"
            className="flex w-full items-center gap-2 rounded-md px-2 py-[6px] text-left text-[12px] text-[#4f554d] transition-colors hover:bg-[#1f241e] hover:text-[#a8a89e]"
          >
            <LogOut className="h-3.5 w-3.5" aria-hidden />
            Log out
          </button>
        </div>
      </aside>

      <main className="flex flex-1 flex-col overflow-hidden">
        <Outlet />
      </main>
    </div>
  )
}
