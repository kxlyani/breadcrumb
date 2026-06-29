import { buildApp } from './app'
import { config } from './config/config'
import { logger } from './infra/logger/logger'

async function start() {
  const app = buildApp()

  try {
    await app.listen({ port: config.PORT, host: '0.0.0.0' })
    logger.info(`🚀 Breadcrumb API running on port ${config.PORT}`)
  } catch (err) {
    logger.error(err, 'Failed to start server')
    process.exit(1)
  }
}

start()