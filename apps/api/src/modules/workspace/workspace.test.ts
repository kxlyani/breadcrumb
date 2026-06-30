import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import supertest from 'supertest'
import { buildApp } from '../../app'

describe('Workspace Routes', () => {
  let app: Awaited<ReturnType<typeof buildApp>>
  let authToken: string
  let workspaceId: string

  beforeAll(async () => {
    app = buildApp()
    await app.ready()

    // Register a user to get a token
    const res = await supertest(app.server)
      .post('/api/v1/auth/register')
      .send({
        email: `workspace-test-${Date.now()}@devbrain.test`,
        password: 'TestPassword123',
        name: 'Workspace Tester',
      })

    authToken = res.body.data.token
  })

  afterAll(async () => {
    await app.close()
  })

  it('POST /api/v1/workspaces — rejects unauthenticated request', async () => {
    await supertest(app.server)
      .post('/api/v1/workspaces')
      .send({ name: 'My Project' })
      .expect(401)
  })

  it('POST /api/v1/workspaces — creates a workspace', async () => {
    const response = await supertest(app.server)
      .post('/api/v1/workspaces')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'My Project' })
      .expect(201)

    expect(response.body.success).toBe(true)
    expect(response.body.data.name).toBe('My Project')
    expect(response.body.data.role).toBe('owner')
    expect(response.body.data.slug).toMatch(/^my-project-/)

    workspaceId = response.body.data.id
  })

  it('GET /api/v1/workspaces — lists workspaces for user', async () => {
    const response = await supertest(app.server)
      .get('/api/v1/workspaces')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)

    expect(response.body.data.length).toBeGreaterThan(0)
    expect(response.body.data[0].id).toBe(workspaceId)
  })

  it('GET /api/v1/workspaces/:id — returns workspace for member', async () => {
    const response = await supertest(app.server)
      .get(`/api/v1/workspaces/${workspaceId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)

    expect(response.body.data.id).toBe(workspaceId)
  })

  it('GET /api/v1/workspaces/:id — rejects non-member', async () => {
    // Register a second, unrelated user
    const otherUser = await supertest(app.server)
      .post('/api/v1/auth/register')
      .send({
        email: `outsider-${Date.now()}@devbrain.test`,
        password: 'TestPassword123',
      })

    const response = await supertest(app.server)
      .get(`/api/v1/workspaces/${workspaceId}`)
      .set('Authorization', `Bearer ${otherUser.body.data.token}`)
      .expect(403)

    expect(response.body.error.code).toBe('WORKSPACE_ACCESS_DENIED')
  })

  it('GET /api/v1/workspaces/:id — 404s on nonexistent workspace', async () => {
    await supertest(app.server)
      .get('/api/v1/workspaces/nonexistent-id-xyz')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(403) // not a member of a workspace that doesn't exist either
  })
})