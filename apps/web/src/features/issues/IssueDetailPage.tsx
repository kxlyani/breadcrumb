import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { issuesApi, type Issue } from '@breadcrumb/api-client'
import { StatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

export function IssueDetailPage() {
  const { workspaceId, issueId } = useParams<{ workspaceId: string; issueId: string }>()
  const [issue, setIssue] = useState<Issue | null>(null)
  const [loading, setLoading] = useState(true)
  const [note, setNote] = useState('')
  const [rootCause, setRootCause] = useState('')
  const [fixDesc, setFixDesc] = useState('')
  const [fixFiles, setFixFiles] = useState('')
  const [saving, setSaving] = useState(false)

  const reload = () =>
    issuesApi.getById(workspaceId!, issueId!).then((data) => {
      setIssue(data)
      setLoading(false)
    })

  useEffect(() => { reload() }, [issueId])

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!note.trim()) return
    setSaving(true)
    await issuesApi.addNote(workspaceId!, issueId!, note.trim())
    setNote('')
    setSaving(false)
    reload()
  }

  const handleSetRootCause = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rootCause.trim()) return
    setSaving(true)
    await issuesApi.setRootCause(workspaceId!, issueId!, rootCause.trim())
    setSaving(false)
    reload()
  }

  const handleRecordFix = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fixDesc.trim()) return
    setSaving(true)
    await issuesApi.recordFix(workspaceId!, issueId!, {
      description: fixDesc.trim(),
      approach: 'CODE_CHANGE',
      affectedFiles: fixFiles.split('\n').map((f) => f.trim()).filter(Boolean),
    })
    setSaving(false)
    reload()
  }

  if (loading) return <div className="p-8 text-sm text-slate-500">Loading...</div>
  if (!issue) return <div className="p-8 text-sm text-red-400">Issue not found.</div>

  return (
    <div className="mx-auto max-w-3xl p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-2 flex items-start gap-3">
          <h1 className="flex-1 text-xl font-semibold text-slate-100">{issue.title}</h1>
          <StatusBadge status={issue.status} />
        </div>
        <p className="text-xs text-slate-500">
          Created {new Date(issue.createdAt).toLocaleDateString()}
          {issue.resolvedAt && ` · Resolved ${new Date(issue.resolvedAt).toLocaleDateString()}`}
        </p>
        {issue.description && (
          <p className="mt-3 text-sm text-slate-400">{issue.description}</p>
        )}
      </div>

      {/* Stack Trace */}
      {issue.stackTrace && (
        <Section title="Stack Trace">
          {issue.stackTrace.exceptionType && (
            <div className="mb-3">
              <span className="rounded bg-red-500/10 border border-red-500/20 px-2 py-0.5 text-xs font-mono text-red-400">
                {issue.stackTrace.exceptionType}
              </span>
              {issue.stackTrace.exceptionMessage && (
                <span className="ml-2 text-sm text-slate-400">{issue.stackTrace.exceptionMessage}</span>
              )}
            </div>
          )}
          <pre className="overflow-x-auto rounded-lg bg-black/30 p-4 text-xs text-slate-400 leading-relaxed">
            {issue.stackTrace.raw}
          </pre>
        </Section>
      )}

      {/* Notes Timeline */}
      <Section title="Investigation Notes">
        {issue.notes.length > 0 && (
          <div className="mb-4 flex flex-col gap-2">
            {issue.notes.map((n) => (
              <div key={n.id} className="rounded-lg border border-white/5 bg-black/20 p-3">
                <p className="text-sm text-slate-300">{n.content}</p>
                <p className="mt-1 text-xs text-slate-600">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
        <form onSubmit={handleAddNote} className="flex gap-2">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note..."
            className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-indigo-500"
          />
          <Button type="submit" size="sm" loading={saving}>Add</Button>
        </form>
      </Section>

      {/* Root Cause */}
      <Section title="Root Cause">
        {issue.rootCause ? (
          <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
            <p className="text-sm text-slate-200">{issue.rootCause.description}</p>
            <p className="mt-1 text-xs text-slate-500">
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
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-indigo-500 resize-none"
            />
            <Button type="submit" size="sm" loading={saving} className="self-start">
              Set Root Cause
            </Button>
          </form>
        )}
      </Section>

      {/* Fix */}
      <Section title="Fix">
        {issue.fix ? (
          <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-4">
            <p className="text-sm text-slate-200">{issue.fix.description}</p>
            {issue.fix.affectedFiles.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {issue.fix.affectedFiles.map((f) => (
                  <span key={f} className="rounded bg-white/5 px-2 py-0.5 font-mono text-xs text-slate-400">
                    {f}
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleRecordFix} className="flex flex-col gap-3">
            <textarea
              value={fixDesc}
              onChange={(e) => setFixDesc(e.target.value)}
              placeholder="What fixed this issue?"
              rows={3}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-indigo-500 resize-none"
            />
            <textarea
              value={fixFiles}
              onChange={(e) => setFixFiles(e.target.value)}
              placeholder="Affected files (one per line)"
              rows={2}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-mono text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-indigo-500 resize-none"
            />
            <Button type="submit" size="sm" loading={saving} className="self-start">
              Record Fix
            </Button>
          </form>
        )}
      </Section>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">{title}</h2>
      {children}
    </div>
  )
}