import fs from 'fs'
import path from 'path'
import os from 'os'

export interface BreadcrumbConfig {
  token: string
  apiUrl: string
  workspaceId: string
  workspaceName: string
}

const CONFIG_DIR  = path.join(os.homedir(), '.breadcrumb')
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json')

export function readConfig(): BreadcrumbConfig | null {
  try {
    if (!fs.existsSync(CONFIG_FILE)) return null
    const raw = fs.readFileSync(CONFIG_FILE, 'utf-8')
    return JSON.parse(raw) as BreadcrumbConfig
  } catch {
    return null
  }
}

export function writeConfig(config: BreadcrumbConfig): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true })
  }
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8')
}

export function clearConfig(): void {
  if (fs.existsSync(CONFIG_FILE)) {
    fs.unlinkSync(CONFIG_FILE)
  }
}

export function requireConfig(): BreadcrumbConfig {
  const config = readConfig()
  if (!config) {
    console.error(
      '\n  Not logged in. Run:\n\n    breadcrumb login --token <your-token>\n'
    )
    process.exit(1)
  }
  return config
}