import chalk from 'chalk'
import { Command } from 'commander'
import { requireConfig } from '../lib/config'
import { createApiClient } from '../lib/api'
import { formatRelativeTime } from '../lib/parser'

const STATUS_COLORS: Record<string, (s: string) => string> = {
  OPEN:          (s) => chalk.hex('#D5957E')(s),
  INVESTIGATING: (s) => chalk.hex('#c4a94a')(s),
  RESOLVED:      (s) => chalk.hex('#6daa7a')(s),
}

function colorStatus(status: string): string {
  const fn = STATUS_COLORS[status] ?? ((s: string) => chalk.dim(s))
  return fn(status.toLowerCase().padEnd(13))
}

export const issuesCommand = new Command('issues')
  .description('List recent issues in your workspace')
  .option('-s, --status <status>', 'Filter by status: open, investigating, resolved')
  .option('-n, --limit <n>', 'Number of issues to show', '15')
  .action(async (opts) => {
    const config = requireConfig()
    const api = createApiClient(config)

    try {
      const result = await api.listIssues(
        opts.status ? { status: opts.status.toUpperCase() } : undefined
      )

      const issues = result.data.slice(0, parseInt(opts.limit))

      if (issues.length === 0) {
        console.log(chalk.dim('\n  No issues found.\n'))
        return
      }

      console.log()
      console.log(
        chalk.dim(`  ${config.workspaceName} — ${result.pagination.total} issues`)
      )
      console.log()

      for (const issue of issues) {
        const time = formatRelativeTime(issue.updatedAt)
        const exc  = issue.exceptionType
          ? chalk.dim(` · ${issue.exceptionType}`)
          : ''

        console.log(
          `  ${colorStatus(issue.status)}  ${chalk.white(issue.title.slice(0, 55).padEnd(55))}  ${chalk.dim(time)}${exc}`
        )
      }

      console.log()
    } catch (err: any) {
      console.error(chalk.red(`\n  Failed to fetch issues: ${err.message}\n`))
      process.exit(1)
    }
  })

export const searchCommand = new Command('search')
  .description('Search your issue knowledge base')
  .argument('<query>', 'Search query')
  .action(async (query: string) => {
    const config = requireConfig()
    const api = createApiClient(config)

    try {
      const results = await api.searchIssues(query)

      if (results.length === 0) {
        console.log(chalk.dim(`\n  No results for "${query}"\n`))
        return
      }

      console.log()
      console.log(chalk.dim(`  ${results.length} result${results.length !== 1 ? 's' : ''} for "${query}"`))
      console.log()

      for (const issue of results) {
        const time = formatRelativeTime(issue.updatedAt)
        const exc  = issue.exceptionType
          ? chalk.dim(` · ${issue.exceptionType}`)
          : ''

        console.log(
          `  ${colorStatus(issue.status)}  ${chalk.white(issue.title.slice(0, 55).padEnd(55))}  ${chalk.dim(time)}${exc}`
        )
      }

      console.log()
    } catch (err: any) {
      console.error(chalk.red(`\n  Failed to search: ${err.message}\n`))
      process.exit(1)
    }
  })