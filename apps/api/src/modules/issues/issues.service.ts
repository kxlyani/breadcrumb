import { prisma } from '../../infra/db/prisma'
import { parseStackTrace } from '@breadcrumb/utils'
import type {
  CreateIssueInput,
  AddNoteInput,
  SetRootCauseInput,
  RecordFixInput,
} from './issues.schema'

export class IssuesService {
  async create(workspaceId: string, input: CreateIssueInput) {
    const issue = await prisma.issue.create({
      data: {
        title: input.title,
        description: input.description,
        workspaceId,
        // If a stack trace was pasted, parse and store it immediately
        stackTrace: input.stackTrace
          ? {
              create: (() => {
                const parsed = parseStackTrace(input.stackTrace!)
                return {
                  raw: input.stackTrace!,
                  exceptionType: parsed.exceptionType,
                  exceptionMessage: parsed.exceptionMessage,
                  language: parsed.language,
                  frames: parsed.frames as any,
                }
              })(),
            }
          : undefined,
      },
      include: {
        stackTrace: true,
        rootCause: true,
        fix: true,
        notes: { orderBy: { createdAt: 'asc' } },
        tags: { include: { tag: true } },
      },
    })

    return formatIssue(issue)
  }

  async list(workspaceId: string, filters: { status?: string; page: number; pageSize: number }) {
    const where = {
      workspaceId,
      ...(filters.status ? { status: filters.status as any } : {}),
    }

    const [total, issues] = await Promise.all([
      prisma.issue.count({ where }),
      prisma.issue.findMany({
        where,
        include: {
          stackTrace: { select: { exceptionType: true, language: true } },
          tags: { include: { tag: true } },
          _count: { select: { notes: true } },
        },
        orderBy: { updatedAt: 'desc' },
        skip: (filters.page - 1) * filters.pageSize,
        take: filters.pageSize,
      }),
    ])

    return {
      issues: issues.map(formatIssueListItem),
      pagination: {
        total,
        page: filters.page,
        pageSize: filters.pageSize,
        hasMore: filters.page * filters.pageSize < total,
      },
    }
  }

  async getById(issueId: string, workspaceId: string) {
    const issue = await prisma.issue.findFirst({
      where: { id: issueId, workspaceId },
      include: {
        stackTrace: true,
        rootCause: true,
        fix: true,
        notes: { orderBy: { createdAt: 'asc' } },
        tags: { include: { tag: true } },
      },
    })

    if (!issue) return null
    return formatIssue(issue)
  }

  async addNote(issueId: string, workspaceId: string, input: AddNoteInput) {
    // Verify issue belongs to workspace first
    const issue = await this.assertIssueExists(issueId, workspaceId)

    const note = await prisma.issueNote.create({
      data: { content: input.content, issueId: issue.id },
    })

    return note
  }

  async setRootCause(issueId: string, workspaceId: string, input: SetRootCauseInput) {
    const issue = await this.assertIssueExists(issueId, workspaceId)

    // Upsert — set or update root cause
    const rootCause = await prisma.rootCause.upsert({
      where: { issueId: issue.id },
      create: { issueId: issue.id, description: input.description },
      update: { description: input.description },
    })

    // Move status to INVESTIGATING if still OPEN
    if (issue.status === 'OPEN') {
      await prisma.issue.update({
        where: { id: issue.id },
        data: { status: 'INVESTIGATING' },
      })
    }

    return rootCause
  }

  async recordFix(issueId: string, workspaceId: string, input: RecordFixInput) {
    const issue = await this.assertIssueExists(issueId, workspaceId)

    const fix = await prisma.fix.upsert({
      where: { issueId: issue.id },
      create: {
        issueId: issue.id,
        description: input.description,
        approach: input.approach as any,
        affectedFiles: input.affectedFiles,
        commitRef: input.commitRef,
      },
      update: {
        description: input.description,
        approach: input.approach as any,
        affectedFiles: input.affectedFiles,
        commitRef: input.commitRef,
      },
    })

    // Auto-resolve the issue when a fix is recorded
    await prisma.issue.update({
      where: { id: issue.id },
      data: { status: 'RESOLVED', resolvedAt: new Date() },
    })

    return fix
  }

  async updateStatus(issueId: string, workspaceId: string, status: string) {
    const issue = await this.assertIssueExists(issueId, workspaceId)

    return prisma.issue.update({
      where: { id: issue.id },
      data: {
        status: status as any,
        resolvedAt: status === 'RESOLVED' ? new Date() : null,
      },
    })
  }

  async search(workspaceId: string, query: string) {
    // Phase 1: PostgreSQL full-text search
    // Phase 3: this becomes semantic/vector search
    const issues = await prisma.issue.findMany({
      where: {
        workspaceId,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { stackTrace: { exceptionType: { contains: query, mode: 'insensitive' } } },
          { stackTrace: { exceptionMessage: { contains: query, mode: 'insensitive' } } },
          { rootCause: { description: { contains: query, mode: 'insensitive' } } },
          { fix: { description: { contains: query, mode: 'insensitive' } } },
        ],
      },
      include: {
        stackTrace: { select: { exceptionType: true, language: true } },
        tags: { include: { tag: true } },
        _count: { select: { notes: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 20,
    })

    return issues.map(formatIssueListItem)
  }

  // Private helper — avoids scattered "does this issue belong to workspace" checks
  private async assertIssueExists(issueId: string, workspaceId: string) {
    const issue = await prisma.issue.findFirst({
      where: { id: issueId, workspaceId },
    })

    if (!issue) {
      throw Object.assign(new Error('Issue not found'), {
        code: 'ISSUE_NOT_FOUND',
        statusCode: 404,
      })
    }

    return issue
  }
}

export const issuesService = new IssuesService()

// --- Formatters ---
// Keep response shaping out of the service logic

function formatIssue(issue: any) {
  return {
    id: issue.id,
    title: issue.title,
    description: issue.description,
    status: issue.status,
    createdAt: issue.createdAt.toISOString(),
    updatedAt: issue.updatedAt.toISOString(),
    resolvedAt: issue.resolvedAt?.toISOString() ?? null,
    stackTrace: issue.stackTrace
      ? {
          raw: issue.stackTrace.raw,
          exceptionType: issue.stackTrace.exceptionType,
          exceptionMessage: issue.stackTrace.exceptionMessage,
          language: issue.stackTrace.language,
          frames: issue.stackTrace.frames,
        }
      : null,
    rootCause: issue.rootCause
      ? {
          description: issue.rootCause.description,
          identifiedAt: issue.rootCause.identifiedAt.toISOString(),
        }
      : null,
    fix: issue.fix
      ? {
          description: issue.fix.description,
          approach: issue.fix.approach,
          affectedFiles: issue.fix.affectedFiles,
          commitRef: issue.fix.commitRef,
        }
      : null,
    notes: issue.notes.map((n: any) => ({
      id: n.id,
      content: n.content,
      createdAt: n.createdAt.toISOString(),
    })),
    tags: issue.tags.map((t: any) => ({
      id: t.tag.id,
      name: t.tag.name,
      color: t.tag.color,
    })),
  }
}

function formatIssueListItem(issue: any) {
  return {
    id: issue.id,
    title: issue.title,
    status: issue.status,
    updatedAt: issue.updatedAt.toISOString(),
    exceptionType: issue.stackTrace?.exceptionType ?? null,
    language: issue.stackTrace?.language ?? null,
    noteCount: issue._count?.notes ?? 0,
    tags: issue.tags?.map((t: any) => ({
      id: t.tag.id,
      name: t.tag.name,
      color: t.tag.color,
    })) ?? [],
  }
}