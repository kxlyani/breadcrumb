import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

interface ComingSoonPageProps {
  title: string
  description: string
  backTo?: { label: string; path: string }
}

export function ComingSoonPage({ title, description, backTo }: ComingSoonPageProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-[#0e0f0d] p-8 text-center">
      <div className="mb-4 flex items-center gap-[4px]">
        <div className="h-[9px] w-[9px] rounded-full bg-[#D5957E]" />
        <div className="h-[5px] w-[5px] rounded-full bg-[#D5957E] opacity-50" />
        <div className="h-[3px] w-[3px] rounded-full bg-[#D5957E] opacity-25" />
      </div>
      <h1 className="mb-2 text-[18px] font-semibold text-[#ede8e3]">{title}</h1>
      <p className="mb-6 max-w-sm text-[12.5px] leading-relaxed text-[#4f554d]">{description}</p>
      <span className="mb-6 inline-block rounded-full border border-[#2a2f28] bg-[#1a1e19] px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-[#D5957E]">
        Coming soon
      </span>
      {backTo && (
        <Link to={backTo.path}>
          <Button variant="ghost" size="sm">
            {backTo.label}
          </Button>
        </Link>
      )}
    </div>
  )
}
