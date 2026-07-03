import { useEffect, useState, useCallback, useMemo } from 'react'
import { useParams, useNavigate, NavLink } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { issuesApi, type IssueListItem } from '@breadcrumb/api-client'
import { useSyncWorkspace } from '@/hooks/useSyncWorkspace'
import { StatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ErrorRetry } from '@/components/ui/ErrorRetry'
import { IssueDetailPage } from './IssueDetailPage'

type StatusTab = 'all' | 'open' | 'investigating' | 'resolved'

const TABS: { key: StatusTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'open', label: 'Open' },
  { key: 'investigating', label: 'Investigating' },
  { key: 'resolved', label: 'Resolved' },
]

function filterByTab(list: IssueListItem[], tab: StatusTab) {
  if (tab === 'all') return list
  return list.filter((i) => i.status === tab.toUpperCase())
}

function sortByRecent(list: IssueListItem[]) {
  return [...list].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )
}

export function IssuesPage() {
  const { workspaceId, issueId } = useParams<{ workspaceId: string; issueId?: string }>()
  const navigate = useNavigate()
  const { notFound: workspaceNotFound } = useSyncWorkspace()

  const [issues, setIssues] = useState<IssueListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [searchHint, setSearchHint] = useState('')
  const [searchResults, setSearchResults] = useState<IssueListItem[] | null>(null)
  const [activeTab, setActiveTab] = useState<StatusTab>('all')

  const reload = useCallback(() => {
    if (!workspaceId) return
    setLoading(true)
    setError('')
    issuesApi
      .list(workspaceId)
      .then((res) => {
        setIssues(res.data)
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to load issues.')
        setLoading(false)
      })
  }, [workspaceId])

  useEffect(() => {
    reload()
  }, [reload])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!workspaceId) return
    const q = search.trim()
    if (q.length === 1) {
      setSearchHint('Type at least 2 characters to search')
      return
    }
    setSearchHint('')
    if (q.length < 2) return
    try {
      const results = await issuesApi.search(workspaceId, q)
      setSearchResults(results)
    } catch {
      setSearchHint('Search failed. Try again.')
    }
  }

  const clearSearch = () => {
    setSearch('')
    setSearchResults(null)
    setSearchHint('')
  }

  const baseList = searchResults ?? issues
  const displayed = useMemo(
    () => sortByRecent(filterByTab(baseList, activeTab)),
    [baseList, activeTab]
  )

  // Auto-select first issue when landing without issueId (desktop-friendly default)
  useEffect(() => {
    if (loading || issueId || displayed.length === 0 || !workspaceId) return
    navigate(`/workspaces/${workspaceId}/issues/${displayed[0].id}`, { replace: true })
  }, [loading, issueId, displayed, workspaceId, navigate])

  // Keep URL in sync when filter excludes current issue
  useEffect(() => {
    if (!workspaceId || loading) return
    if (issueId && displayed.length > 0 && !displayed.some((i) => i.id === issueId)) {
      navigate(`/workspaces/${workspaceId}/issues/${displayed[0].id}`, { replace: true })
    } else if (issueId && displayed.length === 0) {
      navigate(`/workspaces/${workspaceId}/issues`, { replace: true })
    }
  }, [activeTab, displayed, issueId, workspaceId, loading, navigate])

  const showListOnMobile = !issueId

  if (workspaceNotFound) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <ErrorRetry
          message="Workspace not found or you don't have access."
          onRetry={() => navigate('/dashboard')}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Topbar */}
      <div className="flex h-[44px] flex-shrink-0 items-center gap-1 border-b border-[#1f221e] bg-[#141714] px-4">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`h-full border-b-2 px-3 text-[12.5px] transition-all ${
              activeTab === t.key
                ? 'border-[#D5957E] text-[#D5957E]'
                : 'border-transparent text-[#4f554d] hover:text-[#a8a89e]'
            }`}
          >
            {t.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <form
            onSubmit={handleSearch}
            className="flex items-center gap-1.5 rounded-md border border-[#2a2f28] bg-[#1a1e19] px-2.5 py-[5px]"
          >
            <Search className="h-3.5 w-3.5 text-[#4f554d]" aria-hidden />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                if (e.target.value.trim().length !== 1) setSearchHint('')
              }}
              placeholder="Search…"
              aria-label="Search issues"
              className="w-[140px] border-0 bg-transparent text-[12px] text-[#a8a89e] outline-none placeholder-[#4f554d]"
            />
            {searchResults && (
              <button
                type="button"
                onClick={clearSearch}
                aria-label="Clear search"
                className="text-[#4f554d] hover:text-[#a8a89e]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </form>
          {searchHint && (
            <span className="hidden text-[10.5px] text-[#4f554d] sm:inline">{searchHint}</span>
          )}
          <Button size="sm" onClick={() => navigate(`/workspaces/${workspaceId}/issues/new`)}>
            + New issue
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* List panel — hidden on mobile when viewing detail */}
        <div
          className={`flex w-full flex-col overflow-hidden border-r border-[#1f221e] bg-[#141714] md:w-[300px] md:min-w-[300px] ${
            showListOnMobile ? 'flex' : 'hidden md:flex'
          }`}
        >
          <div className="flex items-center justify-between border-b border-[#1f221e] px-3.5 py-2">
            <span className="text-[10.5px] text-[#4f554d]">
              {displayed.length} issue{displayed.length !== 1 ? 's' : ''}
              {searchResults ? ` for "${search}"` : ''}
            </span>
            <span className="text-[10.5px] text-[#4f554d]">Recent</span>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <p className="p-4 text-[12px] text-[#4f554d]">Loading…</p>
            ) : error ? (
              <div className="p-4">
                <ErrorRetry message={error} onRetry={reload} />
              </div>
            ) : displayed.length === 0 ? (
              <div className="p-6 text-center">
                <p className="mb-3 text-[12px] text-[#4f554d]">
                  {searchResults ? 'No results.' : 'No issues yet.'}
                </p>
                {!searchResults && (
                  <Button
                    size="sm"
                    onClick={() => navigate(`/workspaces/${workspaceId}/issues/new`)}
                  >
                    Create issue
                  </Button>
                )}
              </div>
            ) : (
              displayed.map((issue) => (
                <NavLink
                  key={issue.id}
                  to={`/workspaces/${workspaceId}/issues/${issue.id}`}
                  aria-current={issueId === issue.id ? 'page' : undefined}
                  className={({ isActive }) =>
                    `relative block border-b border-[#1f221e] px-3.5 py-3 transition-colors ${
                      isActive
                        ? 'bg-[rgba(213,149,126,0.06)]'
                        : 'hover:bg-[#1a1e19]'
                    }`
                  }
                >
                  <div
                    className={`absolute bottom-0 left-0 top-0 w-[2px] transition-colors ${
                      issueId === issue.id ? 'bg-[#D5957E]' : 'bg-transparent'
                    }`}
                  />
                  <div className="mb-1.5 flex items-start gap-2">
                    <p className="line-clamp-1 flex-1 text-[12.5px] font-medium leading-snug text-[#ede8e3]">
                      {issue.title}
                    </p>
                    <StatusBadge status={issue.status} />
                  </div>
                  <div className="flex items-center gap-2">
                    {issue.exceptionType && (
                      <span
                        className={`flex-1 truncate font-mono text-[11px] ${
                          issueId === issue.id ? 'text-[rgba(213,149,126,0.7)]' : 'text-[#4f554d]'
                        }`}
                      >
                        {issue.exceptionType}
                      </span>
                    )}
                    <span className="flex-shrink-0 text-[10.5px] text-[#4f554d]">
                      {new Date(issue.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </NavLink>
              ))
            )}
          </div>
        </div>

        {/* Detail panel */}
        <div
          className={`flex-1 overflow-y-auto bg-[#0e0f0d] ${
            showListOnMobile ? 'hidden md:block' : 'block'
          }`}
        >
          {issueId ? (
            <IssueDetailPage
              key={issueId}
              workspaceId={workspaceId!}
              issueId={issueId}
              onResolved={reload}
              showMobileBack
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-[12px] text-[#4f554d]">Select an issue to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
