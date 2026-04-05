import z from 'zod'
import { ShopSchema } from 'src/shared/model/share-shop.model'

export const RegisterShopBodySchema = ShopSchema.pick({
  name: true,
  description: true,
  phoneNumber: true,
  address: true,
  email: true,
}).strict()

export const GetMyShopResSchema = ShopSchema
export const GetShopStatisticsResSchema = z
  .object({
    today: z.object({
      totalOrders: z.number(),
      totalRevenue: z.number(),
    }),
    thisMonth: z.object({
      totalOrders: z.number(),
      totalRevenue: z.number(),
    }),
  })
  .strict()
export type RegisterShopBodyType = z.infer<typeof RegisterShopBodySchema>
export type GetMyShopResType = z.infer<typeof GetMyShopResSchema>

export type GetShopStatisticsResType = z.infer<typeof GetShopStatisticsResSchema>
