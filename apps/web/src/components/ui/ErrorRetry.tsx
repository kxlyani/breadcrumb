import { Button } from '@/components/ui/Button'

interface ErrorRetryProps {
  message: string
  onRetry: () => void
}

export function ErrorRetry({ message, onRetry }: ErrorRetryProps) {
  return (
    <div className="rounded-lg border border-[rgba(217,135,110,0.2)] bg-[rgba(217,135,110,0.06)] p-6 text-center">
      <p className="mb-4 text-[12.5px] text-[#d9876e]">{message}</p>
      <Button size="sm" variant="ghost" onClick={onRetry}>
        Try again
      </Button>
    </div>
  )
}
