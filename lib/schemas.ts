import { z } from 'zod'

export const QuestionInput = z.object({
  text: z.string().trim().min(5).max(500),
  author: z
    .string()
    .trim()
    .max(50)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
})
export type QuestionInput = z.infer<typeof QuestionInput>

export const AdminPatch = z.object({
  answered: z.boolean().optional(),
  pinned: z.boolean().optional(),
})
export type AdminPatch = z.infer<typeof AdminPatch>

export const Question = z.object({
  id: z.string().uuid(),
  text: z.string(),
  author: z.string().nullable(),
  cluster_id: z.string().uuid().nullable(),
  upvotes: z.number().int(),
  answered: z.boolean(),
  pinned: z.boolean(),
  created_at: z.string(),
})
export type Question = z.infer<typeof Question>
