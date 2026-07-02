type BadgeVariant = 'open' | 'investigating' | 'resolved' | 'default'

const STATUS_VARIANTS: Record<string, BadgeVariant> = {
  OPEN: 'open',
  INVESTIGATING: 'investigating',
  RESOLVED: 'resolved',
}

const STYLES: Record<BadgeVariant, string> = {
  open: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  investigating: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  resolved: 'bg-green-500/10 text-green-400 border-green-500/20',
  default: 'bg-white/5 text-slate-400 border-white/10',
}

export function StatusBadge({ status }: { status: string }) {
  const variant = STATUS_VARIANTS[status] ?? 'default'
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${STYLES[variant]}`}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  )
}