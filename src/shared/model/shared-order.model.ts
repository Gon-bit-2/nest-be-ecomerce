import { ORDER_STATUS } from 'src/shared/constants/order.constant'
import z from 'zod'

export const OrderStatusSchema = z.enum([
  ORDER_STATUS.PENDING_PAYMENT,
  ORDER_STATUS.PENDING_PICKUP,
  ORDER_STATUS.PENDING_DELIVERY,
  ORDER_STATUS.DELIVERED,
  ORDER_STATUS.RETURNED,
  ORDER_STATUS.CANCELLED,
])

export const OrderSchema = z.object({
  id: z.number(),
  userId: z.number(),
  shopId: z.number().nullable(),
  paymentId: z.number(),
  status: OrderStatusSchema,
  receiver: z.object({
    name: z.string(),
    phone: z.string(),
    address: z.string(),
  }),
  shippingFee: z.number().default(0),
  discountAmount: z.number().default(0),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
})

export const ProductSKUSnapshotSchema = z.object({
  id: z.number(),
  productId: z.number().nullable(),
  productName: z.string(),
  productTranslations: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      description: z.string(),
      languageId: z.string(),
    }),
  ),
  skuId: z.number().nullable(),
  orderId: z.number().nullable(),
  skuPrice: z.number(),
  skuValue: z.string(),
  image: z.string(),
  quantity: z.number(),

  createdAt: z.date(),
})

export const OrderIncludeProductSKUSnapshotSchema = OrderSchema.extend({
  items: z.array(ProductSKUSnapshotSchema),
})
export type OrderType = z.infer<typeof OrderSchema>
export type OrderIncludeProductSKUSnapshotType = z.infer<typeof OrderIncludeProductSKUSnapshotSchema>
