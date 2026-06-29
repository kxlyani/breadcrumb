import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '.prisma/client/default': path.resolve(
        __dirname,
        '../../node_modules/.prisma/client/default.js'
      ),
    },
  },
  test: {
    environment: 'node',
    env: {
      DATABASE_URL: 'postgresql://breadcrumb:breadcrumb_secret@127.0.0.1:5432/breadcrumb_db',
      JWT_SECRET: 'test-secret-that-is-long-enough-for-validation-32chars',
      NODE_ENV: 'test',
    },
  },
})