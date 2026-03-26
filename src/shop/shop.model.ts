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

export type RegisterShopBodyType = z.infer<typeof RegisterShopBodySchema>
export type GetMyShopResType = z.infer<typeof GetMyShopResSchema>
