import type { FastifyInstance } from 'fastify'
import { issuesService } from './issues.service'
import {
  createIssueSchema,
  addNoteSchema,
  setRootCauseSchema,
  recordFixSchema,
  updateStatusSchema,
  listIssuesSchema,
} from './issues.schema'

export async function issueRoutes(app: FastifyInstance) {
  // All issue routes: must be authenticated + workspace member
  app.addHook('preHandler', app.authenticate)
  app.addHook('preHandler', app.verifyWorkspaceAccess)

  // POST /api/v1/workspaces/:workspaceId/issues
  app.post('/', async (request, reply) => {
    const parsed = createIssueSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(422).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: parsed.error.flatten().fieldErrors },
      })
    }

    const issue = await issuesService.create(request.workspace!.id, parsed.data)
    return reply.status(201).send({ success: true, data: issue })
  })

  // GET /api/v1/workspaces/:workspaceId/issues
  app.get('/', async (request, reply) => {
    const parsed = listIssuesSchema.safeParse(request.query)
    if (!parsed.success) {
      return reply.status(422).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid query params' },
      })
    }

    const result = await issuesService.list(request.workspace!.id, parsed.data)
    return reply.send({ success: true, data: result.issues, pagination: result.pagination })
  })

  // GET /api/v1/workspaces/:workspaceId/issues/search
  app.get('/search', async (request, reply) => {
    const { q } = request.query as { q?: string }

    if (!q || q.trim().length < 2) {
      return reply.status(422).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Query must be at least 2 characters' },
      })
    }

    const results = await issuesService.search(request.workspace!.id, q.trim())
    return reply.send({ success: true, data: results })
  })

  // GET /api/v1/workspaces/:workspaceId/issues/:issueId
  app.get('/:issueId', async (request, reply) => {
    const { issueId } = request.params as { issueId: string }
    const issue = await issuesService.getById(issueId, request.workspace!.id)

    if (!issue) {
      return reply.status(404).send({
        success: false,
        error: { code: 'ISSUE_NOT_FOUND', message: 'Issue not found' },
      })
    }

    return reply.send({ success: true, data: issue })
  })

  // POST /api/v1/workspaces/:workspaceId/issues/:issueId/notes
  app.post('/:issueId/notes', async (request, reply) => {
    const { issueId } = request.params as { issueId: string }
    const parsed = addNoteSchema.safeParse(request.body)

    if (!parsed.success) {
      return reply.status(422).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: parsed.error.flatten().fieldErrors },
      })
    }

    const note = await issuesService.addNote(issueId, request.workspace!.id, parsed.data)
    return reply.status(201).send({ success: true, data: note })
  })

  // PUT /api/v1/workspaces/:workspaceId/issues/:issueId/root-cause
  app.put('/:issueId/root-cause', async (request, reply) => {
    const { issueId } = request.params as { issueId: string }
    const parsed = setRootCauseSchema.safeParse(request.body)

    if (!parsed.success) {
      return reply.status(422).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: parsed.error.flatten().fieldErrors },
      })
    }

    const rootCause = await issuesService.setRootCause(issueId, request.workspace!.id, parsed.data)
    return reply.send({ success: true, data: rootCause })
  })

  // PUT /api/v1/workspaces/:workspaceId/issues/:issueId/fix
  app.put('/:issueId/fix', async (request, reply) => {
    const { issueId } = request.params as { issueId: string }
    const parsed = recordFixSchema.safeParse(request.body)

    if (!parsed.success) {
      return reply.status(422).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: parsed.error.flatten().fieldErrors },
      })
    }

    const fix = await issuesService.recordFix(issueId, request.workspace!.id, parsed.data)
    return reply.send({ success: true, data: fix })
  })

  // PATCH /api/v1/workspaces/:workspaceId/issues/:issueId/status
  app.patch('/:issueId/status', async (request, reply) => {
    const { issueId } = request.params as { issueId: string }
    const parsed = updateStatusSchema.safeParse(request.body)

    if (!parsed.success) {
      return reply.status(422).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: parsed.error.flatten().fieldErrors },
      })
    }

    const issue = await issuesService.updateStatus(issueId, request.workspace!.id, parsed.data.status)
    return reply.send({ success: true, data: { id: issue.id, status: issue.status } })
  })
}