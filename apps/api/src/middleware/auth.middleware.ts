import type { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'

// This decorates `app.authenticate` for use in route preHandlers
export const authMiddleware = fp(async (app: FastifyInstance) => {
    // IMP : CHANGE WITH FASTIFY TYPES INSTEAD OF ANY WHEN REQUIRED. 
  app.decorate('authenticate', async (request: any, reply: any) => {
    try {
      await request.jwtVerify()
    } catch (err) {
      reply.status(401).send({
        success: false,
        error: {
          code: 'AUTH_UNAUTHORIZED',
          message: 'Authentication required',
        },
      })
    }
  })
})