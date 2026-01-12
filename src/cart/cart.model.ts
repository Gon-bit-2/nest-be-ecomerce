import { ProductTranslationSchema } from 'src/product/product-translation/product-translation.model'
import { ProductSchema } from 'src/shared/model/shared-product.model'
import { SKUSchema } from 'src/shared/model/shared-sku.model'
import { UserSchema } from 'src/shared/model/shared-user.model'

import z from 'zod'

export const CartItemSchema = z.object({
  id: z.number(),
  quantity: z.number().int().positive(),
  skuId: z.number(),
  userId: z.number(),

  createdAt: z.date(),
  updatedAt: z.date(),
})

export const GetCartItemParamsSchema = z.object({
  cartItemId: z.coerce.number().int().positive(),
})

export const CartItemDetailSchema = z.object({
  shop: UserSchema.pick({
    id: true,
    name: true,
    avatar: true,
  }),
  cartItems: z.array(
    CartItemSchema.extend({
      sku: SKUSchema.extend({
        product: ProductSchema.extend({
          productTranslations: z.array(ProductTranslationSchema),
        }),
      }),
    }),
  ),
})

export const GetCartResSchema = z.object({
  data: z.array(CartItemDetailSchema),
  totalItems: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
})

export const AddCartBodySchema = CartItemSchema.pick({
  skuId: true,
  quantity: true,
}).strict()

export const UpdateCartBodySchema = AddCartBodySchema

export const DeleteCartBodySchema = z
  .object({
    cartItemIds: z.array(z.number().int().positive()),
  })
  .strict()

export type CartItemType = z.infer<typeof CartItemSchema>
export type GetCartItemParamsType = z.infer<typeof GetCartItemParamsSchema>
export type CartItemDetailType = z.infer<typeof CartItemDetailSchema>
export type GetCartResType = z.infer<typeof GetCartResSchema>
export type AddCartBodyType = z.infer<typeof AddCartBodySchema>
export type UpdateCartBodyType = z.infer<typeof UpdateCartBodySchema>
export type DeleteCartBodyType = z.infer<typeof DeleteCartBodySchema>
