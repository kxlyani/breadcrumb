import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { issuesApi, type IssueListItem } from '@breadcrumb/api-client'
import { StatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

export function IssuesPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>()
  const navigate = useNavigate()
  const [issues, setIssues] = useState<IssueListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState<IssueListItem[] | null>(null)

  useEffect(() => {
    if (!workspaceId) return
    issuesApi.list(workspaceId).then((res) => {
      setIssues(res.data)
      setLoading(false)
    })
  }, [workspaceId])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!workspaceId || search.trim().length < 2) return
    const results = await issuesApi.search(workspaceId, search.trim())
    setSearchResults(results)
  }

  const clearSearch = () => {
    setSearch('')
    setSearchResults(null)
  }

  const displayed = searchResults ?? issues

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-100">Issues</h1>
        <Button onClick={() => navigate(`/workspaces/${workspaceId}/issues/new`)}>
          New Issue
        </Button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search issues, errors, fixes..."
          className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-indigo-500"
        />
        <Button type="submit" size="sm">Search</Button>
        {searchResults && <Button type="button" variant="ghost" size="sm" onClick={clearSearch}>Clear</Button>}
      </form>

      {searchResults && (
        <p className="mb-4 text-sm text-slate-500">{searchResults.length} results for "{search}"</p>
      )}

      {loading ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : displayed.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 p-12 text-center">
          <p className="text-slate-500">
            {searchResults ? 'No results found.' : 'No issues yet.'}
          </p>
          {!searchResults && (
            <Button className="mt-4" onClick={() => navigate(`/workspaces/${workspaceId}/issues/new`)}>
              Create your first issue
            </Button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {displayed.map((issue) => (
            <Link
              key={issue.id}
              to={`/workspaces/${workspaceId}/issues/${issue.id}`}
              className="flex items-center gap-4 rounded-xl border border-white/10 bg-[#1a1d27] p-4 transition-colors hover:border-white/20 hover:bg-[#21253a]"
            >
              <div className="flex-1 min-w-0">
                <p className="truncate font-medium text-slate-100">{issue.title}</p>
                {issue.exceptionType && (
                  <p className="mt-0.5 truncate text-xs text-slate-500">
                    {issue.exceptionType}
                    {issue.language && ` · ${issue.language}`}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {issue.noteCount > 0 && (
                  <span className="text-xs text-slate-500">{issue.noteCount} notes</span>
                )}
                <StatusBadge status={issue.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}