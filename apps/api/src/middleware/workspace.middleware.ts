import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import fp from 'fastify-plugin'
import { workspaceService } from '../modules/workspace/workspace.service'

declare module 'fastify' {
  interface FastifyRequest {
    workspace?: { id: string; role: string }
  }
  interface FastifyInstance {
    verifyWorkspaceAccess: (
      request: FastifyRequest,
      reply: FastifyReply
    ) => Promise<void>
  }
}

export const workspaceMiddleware = fp(async (app: FastifyInstance) => {
  app.decorate(
    'verifyWorkspaceAccess',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { workspaceId } = request.params as { workspaceId?: string }
      const user = request.user as { userId: string }

      if (!workspaceId) {
        return reply.status(400).send({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'workspaceId is required' },
        })
      }

      const membership = await workspaceService.isMember(user.userId, workspaceId)

      if (!membership) {
        return reply.status(403).send({
          success: false,
          error: {
            code: 'WORKSPACE_ACCESS_DENIED',
            message: 'You do not have access to this workspace',
          },
        })
      }

      request.workspace = { id: workspaceId, role: membership.role }
    }
  )
})