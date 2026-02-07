import { z } from 'zod'

export const CreateMessageBodySchema = z.object({
  receiverId: z.coerce.number().int().positive(),
  content: z.string().min(1),
})

export const GetConversationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(20),
})

export const GetMessageParamsSchema = z.object({
  conversationId: z.coerce.number().int().positive(),
})

export const GetMessageQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(50),
})

export type CreateMessageBodyType = z.infer<typeof CreateMessageBodySchema>
export type GetConversationQueryType = z.infer<typeof GetConversationQuerySchema>
export type GetMessageParamsType = z.infer<typeof GetMessageParamsSchema>
export type GetMessageQueryType = z.infer<typeof GetMessageQuerySchema>
