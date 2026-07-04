import { spawn } from 'child_process'
import * as readline from 'readline'
import chalk from 'chalk'
import { Command } from 'commander'
import ora from 'ora'
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

export const runCommand = new Command('run')
  .description('Run a command and capture failures automatically')
  .argument('<command...>', 'Command to run')
  .option('-w, --workspace <id>', 'Override workspace ID')
  .allowUnknownOption(true)
  .passThroughOptions(true)
  .action(async (args: string[], opts) => {
    const config = requireConfig()
    if (opts.workspace) config.workspaceId = opts.workspace

    const fullCommand = args.join(' ')
    console.log(chalk.dim(`\n  Running: ${fullCommand}\n`))

    let outputBuffer = ''

    await new Promise<void>((resolve) => {
      const child = spawn(fullCommand, [], {
        shell: 'cmd.exe',
        stdio: ['inherit', 'pipe', 'pipe'],
      })

      child.stdout?.on('data', (data: Buffer) => {
        const text = data.toString()
        process.stdout.write(text)
        outputBuffer += text
      })

      child.stderr?.on('data', (data: Buffer) => {
        const text = data.toString()
        process.stderr.write(text)
        outputBuffer += text
      })

      child.on('close', async (code) => {
        if (code === 0) {
          console.log(chalk.dim(`\n  ✓ Finished successfully\n`))
          resolve()
          return
        }

        console.log()
        console.log(
          `  ${chalk.red('❌')} ${chalk.bold('Command failed')} ${chalk.dim(`(exit code ${code})`)}`
        )
        console.log()

        const extracted = extractError(outputBuffer, fullCommand)
        console.log(`  ${chalk.dim('Detected:')} ${chalk.yellow(extracted.title)}`)
        console.log()

        // Simple text prompt — works reliably on Windows
        console.log(`  ${chalk.dim('Save to Breadcrumb?')}`)
        console.log(`  ${chalk.green('[y]')} Yes   ${chalk.blue('[e]')} Edit title   ${chalk.dim('[n]')} Skip`)
        console.log()

        const answer = await askQuestion('  Your choice: ')
        const choice = answer.toLowerCase()

        if (choice === 'n' || choice === '') {
          console.log(chalk.dim('\n  Skipped.\n'))
          resolve()
          process.exit(code ?? 1)
          return
        }

        let title = extracted.title

        if (choice === 'e') {
          console.log()
          const edited = await askQuestion(`  Title (Enter to keep): `)
          if (edited.trim()) title = edited.trim()
        }

        const spinner = ora('Saving issue…').start()
        try {
          const api = createApiClient(config)
          const issue = await api.createIssue({
            title,
            description: `Captured from CLI command: \`${fullCommand}\``,
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
        }

        resolve()
        process.exit(code ?? 1)
      })
    })
  })