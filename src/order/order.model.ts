import { PaginationQuerySchema } from 'src/shared/model/request.model'
import { ORDER_STATUS } from 'src/shared/constants/order.constant'
import { OrderSchema, OrderStatusSchema, ProductSKUSnapshotSchema } from 'src/shared/model/shared-order.model'
import z from 'zod'

export const GetOrderListResSchema = z.object({
  data: z.array(
    OrderSchema.extend({
      items: z.array(ProductSKUSnapshotSchema),
    }).omit({
      receiver: true,
      deletedAt: true,
      deletedById: true,
      createdById: true,
      updatedById: true,
    }),
  ),
  totalItems: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
})

export const GetOrderListQuerySchema = PaginationQuerySchema.extend({
  status: OrderStatusSchema.optional(),
})

export const GetOrderDetailResSchema = OrderSchema.extend({
  items: z.array(ProductSKUSnapshotSchema),
})

export const CreateOrderBodySchema = z
  .array(
    z
      .object({
        shopId: z.number(),
        receiver: z
          .object({
            name: z.string(),
            phone: z.string(),
            address: z.string(),
          })
          .optional(),
        userAddressId: z.number().int().positive().optional(),
        cartItemIds: z.array(z.number().min(1)),
        shopDiscountCode: z.string().optional(),
        platformDiscountCode: z.string().optional(),
      })
      .refine((data) => data.receiver || data.userAddressId, {
        message: 'Either receiver or userAddressId must be provided',
      }),
  )
  .min(1)

export const CreateOrderBodyResSchema = z.object({ orders: z.array(OrderSchema), paymentId: z.number() })

export const CancelOrderResSchema = OrderSchema

export const GetOrderParamsSchema = z
  .object({
    orderId: z.coerce.number().int().positive(),
  })
  .strict()

export const UpdateOrderStatusSchema = z.object({
  status: z.enum([ORDER_STATUS.DELIVERED, ORDER_STATUS.RETURNED]),
})

export type GetOrderListResType = z.infer<typeof GetOrderListResSchema>
export type GetOrderListQueryType = z.infer<typeof GetOrderListQuerySchema>
export type GetOrderDetailResType = z.infer<typeof GetOrderDetailResSchema>
export type GetOrderParamsType = z.infer<typeof GetOrderParamsSchema>
export type CreateOrderBodyType = z.infer<typeof CreateOrderBodySchema>
export type ResolvedCreateOrderItem = {
  shopId: number
  receiver: { name: string; phone: string; address: string }
  cartItemIds: number[]
  shopDiscountCode?: string
  platformDiscountCode?: string
}
export type CreateOrderBodyResType = z.infer<typeof CreateOrderBodyResSchema>
export type CancelOrderResType = z.infer<typeof CancelOrderResSchema>
export type UpdateOrderStatusType = z.infer<typeof UpdateOrderStatusSchema>
