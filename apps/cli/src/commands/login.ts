import chalk from 'chalk'
import ora from 'ora'
import { Command } from 'commander'
import { writeConfig, clearConfig } from '../lib/config'
import { createApiClient } from '../lib/api'

export const loginCommand = new Command('login')
  .description('Connect the CLI to your Breadcrumb account')
  .requiredOption('--token <token>', 'Your API token from Breadcrumb settings')
  .option('--api-url <url>', 'Breadcrumb API URL', 'breadcrumb-production-484d.up.railway.app')
  .action(async (opts) => {
    const spinner = ora('Verifying token…').start()

    try {
      // Temporarily build a config to test the token
      const tempConfig = {
        token: opts.token,
        apiUrl: opts.apiUrl,
        workspaceId: '',
        workspaceName: '',
      }

      const api = createApiClient(tempConfig)
      const user = await api.me()
      spinner.succeed(`Authenticated as ${chalk.bold(user.email)}`)

      // Let user pick a workspace
      const workspaces = await api.listWorkspaces()

      if (workspaces.length === 0) {
        console.log(
          chalk.yellow('\n  No workspaces found. Create one at your Breadcrumb dashboard first.\n')
        )
        process.exit(1)
      }

      let chosenWorkspace = workspaces[0]

      if (workspaces.length > 1) {
        const { prompt } = await import('enquirer') as any
        const response = await prompt({
          type: 'select',
          name: 'workspace',
          message: 'Select a default workspace',
          choices: workspaces.map((w: any) => ({
            name: w.id,
            message: `${w.name} ${chalk.dim(`(${w.role})`)}`,
          })),
        })
        chosenWorkspace = workspaces.find((w: any) => w.id === response.workspace)!
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
      console.log(
        chalk.dim(`  Config saved to ~/.breadcrumb/config.json\n`)
      )
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