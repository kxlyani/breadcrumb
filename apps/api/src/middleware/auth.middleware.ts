import type { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'
import { prisma } from '../infra/db/prisma'
import bcrypt from 'bcryptjs'

export const authMiddleware = fp(async (app: FastifyInstance) => {
  app.decorate('authenticate', async (request: any, reply: any) => {
    const authHeader = request.headers.authorization as string | undefined

    if (!authHeader) {
      return reply.status(401).send({
        success: false,
        error: { code: 'AUTH_UNAUTHORIZED', message: 'Authentication required' },
      })
    }

    const [scheme, token] = authHeader.split(' ')

    if (scheme !== 'Bearer' || !token) {
      return reply.status(401).send({
        success: false,
        error: { code: 'AUTH_UNAUTHORIZED', message: 'Invalid authorization header' },
      })
    }

    // Try JWT first (web app sessions)
    try {
      const payload = app.jwt.verify(token) as { userId: string }
      request.user = payload
      return
    } catch {
      // Not a valid JWT — try API token
    }

    // Try API token (CLI, VS Code extension)
    // API tokens are 64 hex chars (32 bytes)
    if (token.length === 64) {
      const allTokens = await prisma.apiToken.findMany({
        select: { id: true, tokenHash: true, userId: true },
      })

      for (const storedToken of allTokens) {
        const valid = await bcrypt.compare(token, storedToken.tokenHash)
        if (valid) {
          // Update lastUsedAt without blocking the request
          prisma.apiToken.update({
            where: { id: storedToken.id },
            data: { lastUsedAt: new Date() },
          }).catch(() => {})

          request.user = { userId: storedToken.userId }
          return
        }
      }
    }

    return reply.status(401).send({
      success: false,
      error: { code: 'AUTH_UNAUTHORIZED', message: 'Invalid or expired token' },
    })
  })
})