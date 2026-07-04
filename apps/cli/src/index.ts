#!/usr/bin/env node

import { Command } from 'commander'
import { loginCommand, logoutCommand } from './commands/login'
import { runCommand }                  from './commands/run'
import { captureCommand }              from './commands/capture'
import { issuesCommand, searchCommand } from './commands/issues'

const program = new Command()

program
  .name('breadcrumb')
  .description('Capture and search your debugging history')
  .version('0.1.0')

program.addCommand(loginCommand)
program.addCommand(logoutCommand)
program.addCommand(runCommand)
program.addCommand(captureCommand)
program.addCommand(issuesCommand)
program.addCommand(searchCommand)

program.parse(process.argv)