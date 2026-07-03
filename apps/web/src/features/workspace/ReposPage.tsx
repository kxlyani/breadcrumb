import { useParams } from 'react-router-dom'
import { ComingSoonPage } from '@/components/shared/ComingSoonPage'
import { useSyncWorkspace } from '@/hooks/useSyncWorkspace'

export function ReposPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>()
  useSyncWorkspace()
  return (
    <ComingSoonPage
      title="Repositories"
      description="Connect repositories to link issues with commits, files, and deployment context."
      backTo={{ label: 'Back to issues', path: `/workspaces/${workspaceId}/issues` }}
    />
  )
}
