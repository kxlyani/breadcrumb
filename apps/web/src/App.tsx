import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '@/components/shared/ProtectedRoute'
import { AppLayout } from '@/components/shared/AppLayout'
import { LoginPage } from '@/features/auth/LoginPage'
import { RegisterPage } from '@/features/auth/RegisterPage'
import { DashboardPage } from '@/features/workspace/DashboardPage'
import { NewWorkspacePage } from '@/features/workspace/NewWorkspacePage'
import { IssuesPage } from '@/features/issues/IssuesPage'
import { NewIssuePage } from '@/features/issues/NewIssuePage'
import { IssueDetailPage } from './features/issues/IssueDetailPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected */}
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/workspaces/new" element={<NewWorkspacePage />} />
          <Route path="/workspaces/:workspaceId/issues" element={<IssuesPage />} />
          <Route path="/workspaces/:workspaceId/issues/new" element={<NewIssuePage />} />
          <Route path="/workspaces/:workspaceId/issues/:issueId" element={<IssueDetailPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}