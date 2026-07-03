import { useParams } from 'react-router-dom'
import { ComingSoonPage } from '@/components/shared/ComingSoonPage'
import { useSyncWorkspace } from '@/hooks/useSyncWorkspace'

export function KnowledgePage() {
  const { workspaceId } = useParams<{ workspaceId: string }>()
  useSyncWorkspace()
  return (
    <ComingSoonPage
      title="Knowledge base"
      description="Store and search investigation notes, runbooks, and lessons learned across your team."
      backTo={{ label: 'Back to issues', path: `/workspaces/${workspaceId}/issues` }}
    />
  )
}
