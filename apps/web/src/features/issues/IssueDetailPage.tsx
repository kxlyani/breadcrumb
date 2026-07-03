import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react'
import { issuesApi, type Issue } from '@breadcrumb/api-client'
import { StatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ErrorRetry } from '@/components/ui/ErrorRetry'

interface Props {
  workspaceId?: string
  issueId?: string
  onResolved?: () => void
  showMobileBack?: boolean
}

export function IssueDetailPage({
  workspaceId: wsProp,
  issueId: idProp,
  onResolved,
  showMobileBack,
}: Props) {
  const params = useParams<{ workspaceId: string; issueId: string }>()
  const navigate = useNavigate()
  const workspaceId = wsProp ?? params.workspaceId!
  const issueId = idProp ?? params.issueId!

  const [issue, setIssue] = useState<Issue | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [note, setNote] = useState('')
  const [rootCause, setRootCause] = useState('')
  const [fixDesc, setFixDesc] = useState('')
  const [fixFiles, setFixFiles] = useState('')
  const [saving, setSaving] = useState(false)
  const [traceExpanded, setTraceExpanded] = useState(true)
  const [copied, setCopied] = useState(false)

  const reload = () => {
    setLoading(true)
    setError('')
    return issuesApi
      .getById(workspaceId, issueId)
      .then((data) => {
        setIssue(data)
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to load issue.')
        setLoading(false)
      })
  }

  useEffect(() => {
    reload()
  }, [issueId])

  const handleCopyTrace = async () => {
    if (!issue?.stackTrace?.raw) return
    await navigator.clipboard.writeText(issue.stackTrace.raw)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!note.trim()) return
    setSaving(true)
    await issuesApi.addNote(workspaceId, issueId, note.trim())
    setNote('')
    setSaving(false)
    reload()
  }

  const handleSetRootCause = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rootCause.trim()) return
    setSaving(true)
    await issuesApi.setRootCause(workspaceId, issueId, rootCause.trim())
    setRootCause('')
    setSaving(false)
    reload()
  }

  const handleRecordFix = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fixDesc.trim()) return
    setSaving(true)
    await issuesApi.recordFix(workspaceId, issueId, {
      description: fixDesc.trim(),
      approach: 'CODE_CHANGE',
      affectedFiles: fixFiles.split('\n').map((f) => f.trim()).filter(Boolean),
    })
    setSaving(false)
    onResolved?.()
    reload()
  }

  if (loading) return <div className="p-8 text-[12px] text-[#4f554d]">Loading…</div>
  if (error) {
    return (
      <div className="p-8">
        <ErrorRetry message={error} onRetry={reload} />
      </div>
    )
  }
  if (!issue) return <div className="p-8 text-[12px] text-[#d9876e]">Issue not found.</div>

  const frames = issue.stackTrace?.frames ?? []

  return (
    <div className="mx-auto max-w-[680px] px-4 py-6 pb-16 md:px-8">
      {showMobileBack && (
        <Link
          to={`/workspaces/${workspaceId}/issues`}
          className="mb-4 inline-flex items-center gap-1.5 text-[12px] text-[#4f554d] transition-colors hover:text-[#a8a89e] md:hidden"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to issues
        </Link>
      )}

      <nav className="mb-5 flex items-center gap-1.5 text-[11.5px] text-[#4f554d]" aria-label="Breadcrumb">
        <Link
          to={`/workspaces/${workspaceId}/issues`}
          className="transition-colors hover:text-[#a8a89e]"
        >
          Issues
        </Link>
        <span className="text-[10px] opacity-40" aria-hidden>
          ›
        </span>
        <span className="max-w-[300px] truncate text-[#a8a89e]">{issue.title}</span>
      </nav>

      <h1 className="mb-3 text-[19px] font-semibold leading-snug tracking-tight text-[#ede8e3]">
        {issue.title}
      </h1>

      <div className="mb-7 flex flex-wrap items-center gap-2">
        <StatusBadge status={issue.status} />
        {issue.stackTrace?.exceptionType && (
          <span className="rounded border border-[#2a2f28] bg-[#1a1e19] px-2 py-[2px] font-mono text-[10.5px] text-[#4f554d]">
            {issue.stackTrace.exceptionType}
          </span>
        )}
        {issue.stackTrace?.language && (
          <span className="rounded border border-[#2a2f28] bg-[#1a1e19] px-2 py-[2px] font-mono text-[10.5px] text-[#4f554d]">
            {issue.stackTrace.language}
          </span>
        )}
        {issue.resolvedAt && (
          <span className="rounded border border-[rgba(213,149,126,0.2)] bg-[rgba(213,149,126,0.10)] px-2 py-[2px] text-[10.5px] font-medium text-[#D5957E]">
            Resolved {new Date(issue.resolvedAt).toLocaleDateString()}
          </span>
        )}
        <span className="ml-1 text-[11px] text-[#4f554d]">
          {new Date(issue.createdAt).toLocaleDateString()}
        </span>
      </div>

      {issue.description && (
        <p className="mb-7 text-[12.5px] leading-relaxed text-[#a8a89e]">{issue.description}</p>
      )}

      {issue.stackTrace && (
        <Section label="Stack trace">
          <div className="overflow-hidden rounded-lg border border-[#2a2f28]">
            <div className="flex items-center justify-between border-b border-[#2a2f28] bg-[#1a1e19] px-3.5 py-2">
              <div className="flex min-w-0 items-center gap-2">
                <div className="h-[7px] w-[7px] shrink-0 rounded-full bg-[#c87060]" />
                <span className="font-mono text-[11.5px] font-medium text-[#d9876e]">
                  {issue.stackTrace.exceptionType}
                </span>
                {issue.stackTrace.exceptionMessage && (
                  <span className="max-w-[200px] truncate font-mono text-[11px] text-[#4f554d] md:max-w-[280px]">
                    {issue.stackTrace.exceptionMessage}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {issue.stackTrace.language && (
                  <span className="rounded bg-[#2a2f28] px-2 py-[2px] font-mono text-[10px] text-[#4f554d]">
                    {issue.stackTrace.language}
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleCopyTrace}
                  aria-label="Copy stack trace"
                  className="flex items-center gap-1 rounded px-2 py-[2px] text-[10px] text-[#4f554d] transition-colors hover:bg-[#2a2f28] hover:text-[#a8a89e]"
                >
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
                <button
                  type="button"
                  onClick={() => setTraceExpanded((v) => !v)}
                  aria-expanded={traceExpanded}
                  aria-label={traceExpanded ? 'Collapse stack trace' : 'Expand stack trace'}
                  className="text-[#4f554d] hover:text-[#a8a89e]"
                >
                  {traceExpanded ? (
                    <ChevronUp className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>

            {frames.length > 0 && (
              <div className="border-b border-[#2a2f28] bg-[#141714] px-3.5 py-3 font-mono text-[11px] leading-[1.8]">
                {frames.map((f, i) => (
                  <div key={i} className="flex items-baseline gap-2">
                    <span className="text-[10px] text-[#4f554d]">at</span>
                    {f.functionName && <span className="text-[#a8a89e]">{f.functionName}</span>}
                    {f.file && <span className="text-[#7ab3c8]">{f.file}</span>}
                    {f.line != null && <span className="text-[#4f554d]">:{f.line}</span>}
                  </div>
                ))}
              </div>
            )}

            {traceExpanded && issue.stackTrace.raw && (
              <pre className="max-h-[400px] overflow-auto bg-[#141714] px-3.5 py-3 font-mono text-[11px] leading-relaxed text-[#a8a89e]">
                {issue.stackTrace.raw}
              </pre>
            )}
          </div>
        </Section>
      )}

      <Section label="Investigation trail">
        {issue.notes.length > 0 && (
          <div className="mb-3 flex flex-col gap-[5px]">
            {issue.notes.map((n, i) => (
              <div key={n.id} className="flex gap-3">
                <div className="flex flex-shrink-0 flex-col items-center pt-[4px]">
                  <div className="h-[6px] w-[6px] rounded-full bg-[#D5957E] opacity-50" />
                  {i < issue.notes.length - 1 && (
                    <div className="mt-[3px] min-h-[16px] w-[1px] flex-1 bg-[#2a2f28]" />
                  )}
                </div>
                <div className="mb-1 flex-1 rounded-md border border-[#1f221e] bg-[#141714] px-3 py-2">
                  <p className="text-[12.5px] leading-relaxed text-[#a8a89e]">{n.content}</p>
                  <p className="mt-1 text-[10.5px] text-[#4f554d]">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        <form onSubmit={handleAddNote} className="flex gap-2">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note to your trail…"
            className="flex-1 rounded-md border border-[#2a2f28] bg-[#141714] px-3 py-[7px] text-[12.5px] text-[#a8a89e] outline-none placeholder-[#4f554d] focus:border-[rgba(213,149,126,0.4)]"
          />
          <Button type="submit" size="sm" variant="ghost" loading={saving}>
            Add
          </Button>
        </form>
      </Section>

      <Section label="Root cause">
        {issue.rootCause ? (
          <div className="rounded-md border border-[#2a2f28] border-l-2 border-l-[#c4a94a] bg-[#141714] px-4 py-3">
            <p className="text-[12.5px] leading-relaxed text-[#a8a89e]">{issue.rootCause.description}</p>
            <p className="mt-1.5 text-[10.5px] text-[#4f554d]">
              Identified {new Date(issue.rootCause.identifiedAt).toLocaleString()}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSetRootCause} className="flex flex-col gap-2">
            <textarea
              value={rootCause}
              onChange={(e) => setRootCause(e.target.value)}
              placeholder="What caused this issue?"
              rows={3}
              className="w-full resize-none rounded-md border border-[#2a2f28] bg-[#141714] px-3 py-2 text-[12.5px] text-[#a8a89e] outline-none placeholder-[#4f554d] focus:border-[rgba(213,149,126,0.4)]"
            />
            <Button type="submit" size="sm" variant="ghost" loading={saving} className="self-start">
              Set root cause
            </Button>
          </form>
        )}
      </Section>

      <Section label="Fix">
        {issue.fix ? (
          <div className="rounded-md border border-[#2a2f28] border-l-2 border-l-[#6daa7a] bg-[#141714] px-4 py-3">
            <p className="mb-3 text-[12.5px] leading-relaxed text-[#a8a89e]">{issue.fix.description}</p>
            {issue.fix.affectedFiles.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {issue.fix.affectedFiles.map((f) => (
                  <span
                    key={f}
                    className="rounded border border-[rgba(122,179,200,0.15)] bg-[rgba(122,179,200,0.07)] px-2 py-[2px] font-mono text-[10.5px] text-[#7ab3c8]"
                  >
                    {f}
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleRecordFix} className="flex flex-col gap-2">
            <textarea
              value={fixDesc}
              onChange={(e) => setFixDesc(e.target.value)}
              placeholder="What fixed this issue?"
              rows={3}
              className="w-full resize-none rounded-md border border-[#2a2f28] bg-[#141714] px-3 py-2 text-[12.5px] text-[#a8a89e] outline-none placeholder-[#4f554d] focus:border-[rgba(213,149,126,0.4)]"
            />
            <textarea
              value={fixFiles}
              onChange={(e) => setFixFiles(e.target.value)}
              placeholder="Affected files, one per line"
              rows={2}
              className="w-full resize-none rounded-md border border-[#2a2f28] bg-[#141714] px-3 py-2 font-mono text-[11.5px] text-[#a8a89e] outline-none placeholder-[#4f554d] focus:border-[rgba(213,149,126,0.4)]"
            />
            <Button type="submit" size="sm" loading={saving} className="self-start">
              Record fix
            </Button>
          </form>
        )}
      </Section>
    </div>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-7">
      <div className="mb-3 flex items-center gap-3">
        <span className="whitespace-nowrap text-[10.5px] font-semibold uppercase tracking-[0.09em] text-[#4f554d]">
          {label}
        </span>
        <div className="h-px flex-1 bg-[#1f221e]" />
      </div>
      {children}
    </div>
  )
}
