import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import supertest from 'supertest'
import { buildApp } from '../../app'

const JS_STACK_TRACE = `TypeError: Cannot read properties of undefined (reading 'id')
    at getUserById (src/services/user.service.ts:42:18)
    at async handler (src/routes/user.routes.ts:15:20)`

describe('Issue Routes', () => {
  let app: Awaited<ReturnType<typeof buildApp>>
  let authToken: string
  let workspaceId: string
  let issueId: string

  beforeAll(async () => {
    app = buildApp()
    await app.ready()

    // Register user
    const userRes = await supertest(app.server)
      .post('/api/v1/auth/register')
      .send({
        email: `issues-test-${Date.now()}@breadcrumb.test`,
        password: 'TestPassword123',
      })
    authToken = userRes.body.data.token

    // Create workspace
    const wsRes = await supertest(app.server)
      .post('/api/v1/workspaces')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'Issue Test Workspace' })
    workspaceId = wsRes.body.data.id
  })

  afterAll(async () => {
    await app.close()
  })

  const base = () => `/api/v1/workspaces/${workspaceId}/issues`
  const auth = () => ({ Authorization: `Bearer ${authToken}` })

  it('POST — creates an issue without stack trace', async () => {
    const res = await supertest(app.server)
      .post(base())
      .set(auth())
      .send({ title: 'Redis connection keeps dropping', description: 'Happens every ~30 minutes' })
      .expect(201)

    expect(res.body.data.title).toBe('Redis connection keeps dropping')
    expect(res.body.data.status).toBe('OPEN')
    expect(res.body.data.stackTrace).toBeNull()
  })

  it('POST — creates an issue with stack trace and parses it', async () => {
    const res = await supertest(app.server)
      .post(base())
      .set(auth())
      .send({ title: 'User fetch failing', stackTrace: JS_STACK_TRACE })
      .expect(201)

    expect(res.body.data.stackTrace.exceptionType).toBe('TypeError')
    expect(res.body.data.stackTrace.language).toBe('javascript')
    expect(res.body.data.stackTrace.frames).toHaveLength(2)

    issueId = res.body.data.id
  })

  it('GET / — lists issues in workspace', async () => {
    const res = await supertest(app.server)
      .get(base())
      .set(auth())
      .expect(200)

    expect(res.body.data.length).toBeGreaterThanOrEqual(2)
    expect(res.body.pagination.total).toBeGreaterThanOrEqual(2)
  })

  it('GET /:id — returns full issue detail', async () => {
    const res = await supertest(app.server)
      .get(`${base()}/${issueId}`)
      .set(auth())
      .expect(200)

    expect(res.body.data.id).toBe(issueId)
    expect(res.body.data.notes).toEqual([])
    expect(res.body.data.rootCause).toBeNull()
  })

  it('POST /:id/notes — adds a note to the issue', async () => {
    await supertest(app.server)
      .post(`${base()}/${issueId}/notes`)
      .set(auth())
      .send({ content: 'Checked the user service — null reference on line 42' })
      .expect(201)

    const res = await supertest(app.server)
      .get(`${base()}/${issueId}`)
      .set(auth())

    expect(res.body.data.notes).toHaveLength(1)
    expect(res.body.data.notes[0].content).toBe('Checked the user service — null reference on line 42')
  })

  it('PUT /:id/root-cause — sets root cause and moves status to INVESTIGATING', async () => {
    const res = await supertest(app.server)
      .put(`${base()}/${issueId}/root-cause`)
      .set(auth())
      .send({ description: 'User object not checked for null before accessing .id' })
      .expect(200)

    expect(res.body.data.description).toContain('null')

    const issue = await supertest(app.server)
      .get(`${base()}/${issueId}`)
      .set(auth())

    expect(issue.body.data.status).toBe('INVESTIGATING')
    expect(issue.body.data.rootCause.description).toBeTruthy()
  })

  it('PUT /:id/fix — records fix and auto-resolves the issue', async () => {
    await supertest(app.server)
      .put(`${base()}/${issueId}/fix`)
      .set(auth())
      .send({
        description: 'Added null check before accessing user.id',
        approach: 'CODE_CHANGE',
        affectedFiles: ['src/services/user.service.ts'],
      })
      .expect(200)

    const issue = await supertest(app.server)
      .get(`${base()}/${issueId}`)
      .set(auth())

    expect(issue.body.data.status).toBe('RESOLVED')
    expect(issue.body.data.resolvedAt).not.toBeNull()
    expect(issue.body.data.fix.affectedFiles).toContain('src/services/user.service.ts')
  })

  it('GET /search — finds issue by keyword', async () => {
    const res = await supertest(app.server)
      .get(`${base()}/search?q=TypeError`)
      .set(auth())
      .expect(200)

    expect(res.body.data.length).toBeGreaterThan(0)
    expect(res.body.data[0].exceptionType).toBe('TypeError')
  })

  it('GET /:id — 404 on nonexistent issue', async () => {
    await supertest(app.server)
      .get(`${base()}/nonexistent-id`)
      .set(auth())
      .expect(404)
  })
})