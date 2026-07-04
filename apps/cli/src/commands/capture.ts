import chalk from 'chalk'
import * as readline from 'readline'
import ora from 'ora'
import { Command } from 'commander'
import { requireConfig } from '../lib/config'
import { createApiClient } from '../lib/api'
import { extractError } from '../lib/parser'

function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true,
    })
    rl.question(question, (answer) => {
      rl.close()
      resolve(answer.trim())
    })
  })
}

export const captureCommand = new Command('capture')
  .description('Capture an error from piped output')
  .option('-t, --title <title>', 'Issue title (skips interactive prompt)')
  .option('-w, --workspace <id>', 'Override workspace ID')
  .action(async (opts) => {
    const config = requireConfig()
    if (opts.workspace) config.workspaceId = opts.workspace

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
        console.log(`  ${chalk.dim('Save to Breadcrumb?')}`)
        console.log(`  ${chalk.green('[y]')} Yes   ${chalk.blue('[e]')} Edit title   ${chalk.dim('[n]')} Skip`)
        console.log()

        // Reopen stdin for input since it was used for piped data
        const fs = await import('fs')
        const ttyPath = process.platform === 'win32' ? '\\\\.\\CON' : '/dev/tty'
        const fd = fs.openSync(ttyPath, 'r+')
        const ttyStream = fs.createReadStream('', { fd })

        const answer = await new Promise<string>((resolve) => {
          const rl = readline.createInterface({
            input: ttyStream,
            output: process.stdout,
            terminal: true,
          })
          rl.question('  Your choice: ', (ans) => {
            rl.close()
            resolve(ans.trim().toLowerCase())
          })
        })

        if (answer === 'n' || answer === '') {
          console.log(chalk.dim('\n  Skipped.\n'))
          process.exit(0)
          return
        }

        if (answer === 'e') {
          const edited = await new Promise<string>((resolve) => {
            const rl = readline.createInterface({
              input: process.stdin,
              output: process.stdout,
            })
            rl.question('  Title: ', (ans) => {
              rl.close()
              resolve(ans.trim())
            })
          })
          if (edited) title = edited
        } else {
          title = extracted.title
        }
      }

      const spinner = ora('Saving issue…').start()
      try {
        const api = createApiClient(config)
        const issue = await api.createIssue({
          title: title!,
          description: 'Captured via breadcrumb capture (piped input)',
          stackTrace: extracted.stackTrace ?? undefined,
        })
        spinner.succeed('Issue saved')
        console.log()
        console.log(`  ${chalk.green('✓')} ${chalk.bold(issue.title)}`)
        console.log(chalk.dim(`  View at your Breadcrumb dashboard → Issues`))
        console.log()
      } catch (err: any) {
        spinner.fail('Failed to save issue')
        console.error(chalk.red(`  ${err.message}\n`))
        process.exit(1)
      }
    })
  })