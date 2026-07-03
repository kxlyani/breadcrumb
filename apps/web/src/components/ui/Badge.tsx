const STATUS_STYLES: Record<string, string> = {
  OPEN:          'bg-[rgba(213,149,126,0.12)] text-[#D5957E]',
  INVESTIGATING: 'bg-[rgba(180,160,80,0.10)] text-[#c4a94a]',
  RESOLVED:      'bg-[rgba(100,170,110,0.10)] text-[#6daa7a]',
}

export function StatusBadge({ status }: { status: string }) {
  const styles = STATUS_STYLES[status] ?? 'bg-[#1a1e19] text-[#4f554d]'
  const label = status.charAt(0) + status.slice(1).toLowerCase()
  return (
    <span className={`inline-flex items-center rounded px-[7px] py-[2px] text-[10px] font-medium ${styles}`}>
      {label}
    </span>
  )
}