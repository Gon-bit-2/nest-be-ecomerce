import z from 'zod'

export const languageSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdById: z.number(),
  updatedById: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().optional(),
})

export type LanguageType = z.infer<typeof languageSchema>
