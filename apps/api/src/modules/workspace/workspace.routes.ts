import type { FastifyInstance } from 'fastify'
import { workspaceService } from './workspace.service'
import { createWorkspaceSchema } from './workspace.schema'

export async function workspaceRoutes(app: FastifyInstance) {
  // All workspace routes require auth
  app.addHook('preHandler', app.authenticate)

  // POST /api/v1/workspaces
  app.post('/', async (request, reply) => {
    const parsed = createWorkspaceSchema.safeParse(request.body)

    if (!parsed.success) {
      return reply.status(422).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          details: parsed.error.flatten().fieldErrors,
        },
      })
    }

    const user = request.user as { userId: string }
    const workspace = await workspaceService.create(user.userId, parsed.data)

    return reply.status(201).send({ success: true, data: workspace })
  })

  // GET /api/v1/workspaces
  app.get('/', async (request, reply) => {
    const user = request.user as { userId: string }
    const workspaces = await workspaceService.listForUser(user.userId)

    return reply.send({ success: true, data: workspaces })
  })

  // GET /api/v1/workspaces/:workspaceId
  app.get(
    '/:workspaceId',
    { preHandler: [app.verifyWorkspaceAccess] },
    async (request, reply) => {
      const workspace = await workspaceService.getById(request.workspace!.id)

      if (!workspace) {
        return reply.status(404).send({
          success: false,
          error: { code: 'WORKSPACE_NOT_FOUND', message: 'Workspace not found' },
        })
      }

      return reply.send({
        success: true,
        data: {
          id: workspace.id,
          name: workspace.name,
          slug: workspace.slug,
          role: request.workspace!.role,
          createdAt: workspace.createdAt.toISOString(),
        },
      })
    }
  )
}