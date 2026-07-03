import { ComingSoonPage } from '@/components/shared/ComingSoonPage'

export function AssistantPage() {
  return (
    <ComingSoonPage
      title="AI assistant"
      description="Get help investigating issues, summarizing stack traces, and drafting root-cause notes."
      backTo={{ label: 'Back to dashboard', path: '/dashboard' }}
    />
  )
}
