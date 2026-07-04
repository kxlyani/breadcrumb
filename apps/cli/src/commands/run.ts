import { spawn } from 'child_process'
import chalk from 'chalk'
import { Command } from 'commander'
import ora from 'ora'
import { requireConfig } from '../lib/config'
import { createApiClient } from '../lib/api'
import { extractError } from '../lib/parser'

export const runCommand = new Command('run')
  .description('Run a command and capture failures automatically')
  .argument('<command...>', 'Command to run')
  .option('-w, --workspace <id>', 'Override workspace ID')
  .action(async (args: string[], opts) => {
    const config = requireConfig()
    if (opts.workspace) config.workspaceId = opts.workspace

    const [cmd, ...cmdArgs] = args
    const fullCommand = args.join(' ')

    console.log(chalk.dim(`\n  Running: ${fullCommand}\n`))

    // Collect output while streaming it live
    let outputBuffer = ''

    const child = spawn(cmd, cmdArgs, {
      stdio: ['inherit', 'pipe', 'pipe'],
      shell: true,
    })

    // Stream stdout live AND collect it
    child.stdout?.on('data', (data: Buffer) => {
      const text = data.toString()
      process.stdout.write(text)
      outputBuffer += text
    })

    // Stream stderr live AND collect it
    child.stderr?.on('data', (data: Buffer) => {
      const text = data.toString()
      process.stderr.write(text)
      outputBuffer += text
    })

    child.on('close', async (code) => {
      // Command succeeded — do nothing
      if (code === 0) {
        console.log(chalk.dim(`\n  ✓ Finished successfully\n`))
        return
      }

      // Command failed
      console.log()
      console.log(
        `  ${chalk.red('❌')} ${chalk.bold(`Command failed`)} ${chalk.dim(`(exit code ${code})`)}`
      )
      console.log()

      const extracted = extractError(outputBuffer, fullCommand)

      // Show what we extracted
      console.log(`  ${chalk.dim('Detected:')} ${chalk.yellow(extracted.title)}`)
      console.log()

      // Ask what to do
      const { prompt } = await import('enquirer') as any

      let action: string
      try {
        const response = await prompt({
          type: 'select',
          name: 'action',
          message: 'Save to Breadcrumb?',
          choices: [
            { name: 'save',  message: `${chalk.green('Yes')}  — save with detected title` },
            { name: 'edit',  message: `${chalk.blue('Edit')} — change the title first` },
            { name: 'skip',  message: `${chalk.dim('Skip')} — don\'t save` },
          ],
        })
        action = response.action
      } catch {
        // User hit Ctrl+C on the prompt
        console.log(chalk.dim('\n  Skipped.\n'))
        process.exit(code ?? 1)
      }

      if (action === 'skip') {
        console.log(chalk.dim('\n  Skipped.\n'))
        process.exit(code ?? 1)
      }

      let title = extracted.title

      if (action === 'edit') {
        const { prompt: prompt2 } = await import('enquirer') as any
        const response = await prompt2({
          type: 'input',
          name: 'title',
          message: 'Issue title',
          initial: extracted.title,
        })
        title = response.title
      }

      // Save the issue
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
        console.log(
          `  ${chalk.green('✓')} ${chalk.bold(issue.title)}`
        )
        console.log(
          chalk.dim(`  ${config.apiUrl.replace('api.', '')}/workspaces/${config.workspaceId}/issues/${issue.id}`)
        )
        console.log()
      } catch (err: any) {
        spinner.fail('Failed to save issue')
        console.error(chalk.red(`  ${err.message}\n`))
      }

      process.exit(code ?? 1)
    })
  })