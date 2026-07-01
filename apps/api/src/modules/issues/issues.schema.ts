import { z } from 'zod'

export const createIssueSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  stackTrace: z.string().optional(),
})

export const addNoteSchema = z.object({
  content: z.string().min(1),
})

export const setRootCauseSchema = z.object({
  description: z.string().min(1),
})

export const recordFixSchema = z.object({
  description: z.string().min(1),
  approach: z.enum(['CODE_CHANGE', 'CONFIG_CHANGE', 'DEPENDENCY_UPDATE', 'INFRASTRUCTURE', 'OTHER']).default('CODE_CHANGE'),
  affectedFiles: z.array(z.string()).default([]),
  commitRef: z.string().optional(),
})

export const updateStatusSchema = z.object({
  status: z.enum(['OPEN', 'INVESTIGATING', 'RESOLVED']),
})

export const listIssuesSchema = z.object({
  status: z.enum(['OPEN', 'INVESTIGATING', 'RESOLVED']).optional(),
  page: z.coerce.number().default(1),
  pageSize: z.coerce.number().default(20),
})

export type CreateIssueInput = z.infer<typeof createIssueSchema>
export type AddNoteInput = z.infer<typeof addNoteSchema>
export type SetRootCauseInput = z.infer<typeof setRootCauseSchema>
export type RecordFixInput = z.infer<typeof recordFixSchema>