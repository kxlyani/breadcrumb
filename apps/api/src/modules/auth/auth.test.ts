import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import supertest from 'supertest'
import { buildApp } from '../../app'

describe('Auth Routes', () => {
  let app: Awaited<ReturnType<typeof buildApp>>
  let authToken: string

  beforeAll(async () => {
    app = buildApp()
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  const testUser = {
    email: `test-${Date.now()}@breadcrumb.test`,
    password: 'TestPassword123',
    name: 'Test User',
  }

  it('POST /api/v1/auth/register — creates a new user', async () => {
    const response = await supertest(app.server)
      .post('/api/v1/auth/register')
      .send(testUser)
      .expect(201)

    expect(response.body.success).toBe(true)
    expect(response.body.data.token).toBeDefined()
    expect(response.body.data.user.email).toBe(testUser.email)
    expect(response.body.data.user).not.toHaveProperty('passwordHash')
  })

  it('POST /api/v1/auth/register — rejects duplicate email', async () => {
    const response = await supertest(app.server)
      .post('/api/v1/auth/register')
      .send(testUser)
      .expect(409)

    expect(response.body.success).toBe(false)
    expect(response.body.error.code).toBe('AUTH_EMAIL_TAKEN')
  })

  it('POST /api/v1/auth/login — returns token with valid credentials', async () => {
    const response = await supertest(app.server)
      .post('/api/v1/auth/login')
      .send({ email: testUser.email, password: testUser.password })
      .expect(200)

    expect(response.body.success).toBe(true)
    expect(response.body.data.token).toBeDefined()
    authToken = response.body.data.token
  })

  it('POST /api/v1/auth/login — rejects wrong password', async () => {
    const response = await supertest(app.server)
      .post('/api/v1/auth/login')
      .send({ email: testUser.email, password: 'wrongpassword' })
      .expect(401)

    expect(response.body.error.code).toBe('AUTH_INVALID_CREDENTIALS')
  })

  it('GET /api/v1/auth/me — returns user with valid token', async () => {
    const response = await supertest(app.server)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)

    expect(response.body.data.user.email).toBe(testUser.email)
  })

  it('GET /api/v1/auth/me — rejects missing token', async () => {
    await supertest(app.server)
      .get('/api/v1/auth/me')
      .expect(401)
  })
})