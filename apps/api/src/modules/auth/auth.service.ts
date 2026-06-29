import bcrypt from 'bcryptjs'
import { prisma } from '../../infra/db/prisma'
import type { RegisterInput, LoginInput } from './auth.schema'

export class AuthService {
  async register(input: RegisterInput) {
    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: input.email },
    })

    if (existing) {
      throw Object.assign(new Error('Email already in use'), { 
        code: 'AUTH_EMAIL_TAKEN',
        statusCode: 409 
      })
    }

    // Hash password — never store plaintext
    const passwordHash = await bcrypt.hash(input.password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        email: input.email,
        name: input.name ?? null,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    })

    return user
  }

  async login(input: LoginInput) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    })

    // Use constant-time comparison to prevent timing attacks
    // Even if user doesn't exist, we run bcrypt to prevent user enumeration
    const passwordHash = user?.passwordHash ?? '$2a$12$invalid.hash.to.prevent.timing.attack'
    const valid = await bcrypt.compare(input.password, passwordHash)

    if (!user || !valid) {
      throw Object.assign(new Error('Invalid email or password'), {
        code: 'AUTH_INVALID_CREDENTIALS',
        statusCode: 401,
      })
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
    }
  }

  async getUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    })
  }
}

export const authService = new AuthService()