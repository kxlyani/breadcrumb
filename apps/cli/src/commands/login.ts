import * as readline from 'readline'
import chalk from 'chalk'
import ora from 'ora'
import { Command } from 'commander'
import { writeConfig, clearConfig } from '../lib/config'
import { createApiClient } from '../lib/api'

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

export const loginCommand = new Command('login')
  .description('Connect the CLI to your Breadcrumb account')
  .requiredOption('--token <token>', 'Your API token from Breadcrumb settings')
  .option('--api-url <url>', 'Breadcrumb API URL', 'https://breadcrumb-production-484d.up.railway.app')
  .action(async (opts) => {
    const spinner = ora('Verifying token…').start()

    try {
      const tempConfig = {
        token: opts.token,
        apiUrl: opts.apiUrl,
        workspaceId: '',
        workspaceName: '',
      }

      const api = createApiClient(tempConfig)
      const user = await api.me()
      spinner.succeed(`Authenticated as ${chalk.bold(user.email)}`)

      const workspaces = await api.listWorkspaces()

      if (workspaces.length === 0) {
        console.log(
          chalk.yellow('\n  No workspaces found. Create one at your Breadcrumb dashboard first.\n')
        )
        process.exit(1)
      }

      let chosenWorkspace = workspaces[0]

      if (workspaces.length > 1) {
        console.log('\n  Available workspaces:\n')
        workspaces.forEach((w, i) => {
          console.log(`  ${chalk.bold(String(i + 1))}  ${w.name} ${chalk.dim(`(${w.role})`)}`)
        })
        console.log()

        const answer = await askQuestion(`  Select workspace (1-${workspaces.length}): `)
        const index = parseInt(answer) - 1

        if (index >= 0 && index < workspaces.length) {
          chosenWorkspace = workspaces[index]
        } else {
          console.log(chalk.dim('  Invalid choice, defaulting to first workspace.'))
        }
      }

      writeConfig({
        token: opts.token,
        apiUrl: opts.apiUrl,
        workspaceId: chosenWorkspace.id,
        workspaceName: chosenWorkspace.name,
      })

      console.log(
        `\n  ${chalk.green('✓')} Logged in — workspace set to ${chalk.bold(chosenWorkspace.name)}`
      )
      console.log(chalk.dim(`  Config saved to ~/.breadcrumb/config.json\n`))

    } catch (err: any) {
      spinner.fail('Authentication failed')
      if (err.response?.status === 401) {
        console.error(chalk.red('  Invalid token. Check your Breadcrumb settings page.\n'))
      } else {
        console.error(chalk.red(`  ${err.message}\n`))
      }
      process.exit(1)
    }
  })

export const logoutCommand = new Command('logout')
  .description('Remove saved credentials')
  .action(() => {
    clearConfig()
    console.log(`\n  ${chalk.green('✓')} Logged out. Config removed.\n`)
  })