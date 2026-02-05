import z from 'zod'

import { VideoStatus } from '@prisma/client'

export const ShopVideoSchema = z.object({
  id: z.number(),
  caption: z.string().max(2000).nullable(),
  videoUrl: z.string().url(),
  thumbnailUrl: z.string().url().nullable(),
  status: z.nativeEnum(VideoStatus).default(VideoStatus.ACTIVE),

  viewCount: z.number().int().default(0),
  likeCount: z.number().int().default(0),
  commentCount: z.number().int().default(0),
  shareCount: z.number().int().default(0),

  shopId: z.number().int(),

  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
})

export const CreateShopVideoBodySchema = z.object({
  caption: z.string().max(2000).optional(),
  videoUrl: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  productIds: z.array(z.number().int().positive()).optional(),
})

export const UpdateShopVideoBodySchema = z.object({
  caption: z.string().max(2000).optional(),
  status: z.nativeEnum(VideoStatus).optional(),
  thumbnailUrl: z.string().url().optional(),
  productIds: z.array(z.number().int().positive()).optional(),
})

export const ShopVideoQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
  shopId: z.coerce.number().int().positive().optional(),
})

export const AddCommentBodySchema = z.object({
  content: z.string().min(1).max(1000),
  parentId: z.number().int().positive().optional(),
})

export const AddCommentResSchema = z.object({
  id: z.number(),
  content: z.string(),
  createdAt: z.date(),
  user: z.object({
    id: z.number(),
    name: z.string(),
    avatar: z.string().nullable(),
  }),
})

export type ShopVideoType = z.infer<typeof ShopVideoSchema>
export type CreateShopVideoBodyType = z.infer<typeof CreateShopVideoBodySchema>
export type UpdateShopVideoBodyType = z.infer<typeof UpdateShopVideoBodySchema>
export type ShopVideoQueryType = z.infer<typeof ShopVideoQuerySchema>
export type AddCommentBodyType = z.infer<typeof AddCommentBodySchema>
