import chalk from 'chalk'
import ora from 'ora'
import { Command } from 'commander'
import { requireConfig } from '../lib/config'
import { createApiClient } from '../lib/api'
import { extractError } from '../lib/parser'

export const captureCommand = new Command('capture')
  .description('Capture an error from piped output')
  .option('-t, --title <title>', 'Issue title (skips interactive prompt)')
  .option('-w, --workspace <id>', 'Override workspace ID')
  .action(async (opts) => {
    const config = requireConfig()
    if (opts.workspace) config.workspaceId = opts.workspace

    // Read from stdin
    const chunks: Buffer[] = []
    process.stdin.on('data', (chunk) => chunks.push(chunk))

    process.stdin.on('end', async () => {
      const raw = Buffer.concat(chunks).toString('utf-8').trim()

      if (!raw) {
        console.error(chalk.red('\n  No input received. Pipe something into breadcrumb capture.\n'))
        console.error(chalk.dim('  Example: npm run build 2>&1 | breadcrumb capture\n'))
        process.exit(1)
      }

      const extracted = extractError(raw, 'piped input')

      console.log()
      console.log(`  ${chalk.dim('Detected:')} ${chalk.yellow(extracted.title)}`)
      console.log()

      let title = opts.title

      if (!title) {
        const { prompt } = await import('enquirer') as any
        let action: string

        try {
          const response = await prompt({
            type: 'select',
            name: 'action',
            message: 'Save to Breadcrumb?',
            choices: [
              { name: 'save', message: `${chalk.green('Yes')}  — save with detected title` },
              { name: 'edit', message: `${chalk.blue('Edit')} — change the title first` },
              { name: 'skip', message: `${chalk.dim('Skip')} — don\'t save` },
            ],
          })
          action = response.action
        } catch {
          console.log(chalk.dim('\n  Skipped.\n'))
          process.exit(0)
        }

        if (action === 'skip') {
          console.log(chalk.dim('\n  Skipped.\n'))
          process.exit(0)
        }

        if (action === 'edit') {
          const { prompt: prompt2 } = await import('enquirer') as any
          const response = await prompt2({
            type: 'input',
            name: 'title',
            message: 'Issue title',
            initial: extracted.title,
          })
          title = response.title
        } else {
          title = extracted.title
        }
      }

      const spinner = ora('Saving issue…').start()

      try {
        const api = createApiClient(config)
        const issue = await api.createIssue({
          title,
          description: 'Captured via breadcrumb capture (piped input)',
          stackTrace: extracted.stackTrace ?? undefined,
        })

        spinner.succeed('Issue saved')
        console.log()
        console.log(`  ${chalk.green('✓')} ${chalk.bold(issue.title)}`)
        console.log(
          chalk.dim(`  ${config.apiUrl.replace('api.', '')}/workspaces/${config.workspaceId}/issues/${issue.id}`)
        )
        console.log()
      } catch (err: any) {
        spinner.fail('Failed to save issue')
        console.error(chalk.red(`  ${err.message}\n`))
        process.exit(1)
      }
    })
  })