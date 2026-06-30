import { prisma } from '../../infra/db/prisma'
import { generateUniqueSlug } from '@breadcrumb/utils'
import type { CreateWorkspaceInput } from './workspace.schema'

export class WorkspaceService {
  async create(userId: string, input: CreateWorkspaceInput) {
    const slug = generateUniqueSlug(input.name)

    const workspace = await prisma.workspace.create({
      data: {
        name: input.name,
        slug,
        members: {
          create: {
            userId,
            role: 'owner',
          },
        },
      },
    })

    return {
      id: workspace.id,
      name: workspace.name,
      slug: workspace.slug,
      role: 'owner',
      createdAt: workspace.createdAt.toISOString(),
    }
  }

  async listForUser(userId: string) {
    const memberships = await prisma.workspaceMember.findMany({
      where: { userId },
      include: { workspace: true },
      orderBy: { joinedAt: 'desc' },
    })

    return memberships.map((m) => ({
      id: m.workspace.id,
      name: m.workspace.name,
      slug: m.workspace.slug,
      role: m.role,
      createdAt: m.workspace.createdAt.toISOString(),
    }))
  }

  async getById(workspaceId: string) {
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    })

    return workspace
  }

  async isMember(userId: string, workspaceId: string) {
    const membership = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: { userId, workspaceId },
      },
    })

    return membership
  }
}

export const workspaceService = new WorkspaceService()