import z from 'zod'
import { ShopStatus } from '../constants/shop.constant'

export const ShopSchema = z.object({
  id: z.number(),
  name: z.string().min(1).max(255),
  description: z.string().nullable(),
  phoneNumber: z.string().max(50).nullable(),
  address: z.string().max(1000).nullable(),
  email: z.string().email().max(255).nullable(),
  status: z.enum([ShopStatus.PENDING, ShopStatus.APPROVED, ShopStatus.REJECTED]),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type ShopType = z.infer<typeof ShopSchema>
