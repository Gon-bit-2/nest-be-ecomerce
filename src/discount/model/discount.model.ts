import z from 'zod'
import { DISCOUNT_APPLY_TO, DISCOUNT_SCOPE, DISCOUNT_TYPE } from 'src/shared/constants/discount.constant'

export const DiscountSchema = z.object({
  id: z.number(),
  shopId: z.number().nullish(),
  productIds: z.array(z.number()).default([]),
  categoryIds: z.array(z.number()).default([]),
  userId: z.number().nullish(),
  name: z.string().min(1, 'Name is required'),
  value: z.number().min(1, 'Value is required'),
  maxDiscountValue: z.number().default(0).nullish(),
  type: z.enum(DISCOUNT_TYPE),
  scope: z.enum(DISCOUNT_SCOPE),
  code: z.string().min(1, 'Code is required'),
  description: z.string().min(1, 'Description is required'),
  maxTotalUses: z.number().default(0),
  applyTo: z.enum(DISCOUNT_APPLY_TO),
  maxUsesPerUser: z.number().default(0),
  useCount: z.number().default(0),
  minOrderValue: z.number().default(0),
  isActive: z.boolean().default(false),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
})

export const CreateDiscountSchema = DiscountSchema.pick({
  shopId: true,
  productIds: true,
  categoryIds: true,
  name: true,
  value: true,
  maxDiscountValue: true,
  type: true,
  scope: true,
  code: true,
  description: true,
  maxTotalUses: true,
  applyTo: true,
  maxUsesPerUser: true,
  minOrderValue: true,
  isActive: true,
  startDate: true,
  endDate: true,
})
  .extend({
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
  })
  .refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
    message: 'End date must be greater than start date',
    path: ['endDate'],
  })

export const CreateDiscountResSchema = DiscountSchema
export const UpdateDiscountSchema = CreateDiscountSchema.partial().omit({
  code: true,
})

export const GetDiscountListResSchema = z.object({
  data: z.array(
    DiscountSchema.pick({
      id: true,
      shopId: true,
      name: true,
      value: true,
      maxDiscountValue: true,
      type: true,
      scope: true,
      code: true,
      description: true,
      maxTotalUses: true,
      applyTo: true,
      maxUsesPerUser: true,
      minOrderValue: true,
      isActive: true,
      startDate: true,
      endDate: true,
    }),
  ),
  totalItems: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
})
export const GetDiscountListSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(), // Tìm theo tên hoặc code
  type: z.enum(DISCOUNT_TYPE).optional(),
  scope: z.enum(DISCOUNT_SCOPE).optional(),
  isActive: z.coerce.boolean().optional(),
  shopId: z.coerce.number().optional(), // Lọc voucher của shop nào
})
export const GetDiscountParamsSchema = z
  .object({
    discountId: z.coerce.number().int().positive(),
  })
  .strict()
export const ApplyDiscountSchema = z.object({
  code: z.string(),
  orderValue: z.number(),
  shippingFee: z.number().default(0),
  userId: z.number(),
  shopId: z.number().optional(), // Để check xem mã shop này có hợp lệ với đơn hàng ko
  items: z.array(
    z.object({
      productId: z.number(),
      categoryId: z.number().optional(), // Nếu BE không tự lookup thì FE truyền lên
      price: z.number(),
      quantity: z.number(),
    }),
  ),
})
// Preview/Review Discount (Giống Apply nhưng dùng cho API Preview riêng biệt)
export const PreviewDiscountSchema = ApplyDiscountSchema
export const PreviewDiscountResSchema = z.object({
  isValid: z.boolean(),
  discountAmount: z.number(),
  shippingDiscount: z.number().default(0),
  finalPrice: z.number(),
  finalShippingFee: z.number().default(0),
  message: z.string().optional(),
  discountType: z.enum(DISCOUNT_TYPE).optional(),
  discountRawValue: z.number().optional(),
  maxDiscountValue: z.number().nullish(),
  applicableAmount: z.number().optional(),
})

export type DiscountType = z.infer<typeof DiscountSchema>
export type CreateDiscountBodyType = z.infer<typeof CreateDiscountSchema>
export type CreateDiscountBodyResType = z.infer<typeof CreateDiscountResSchema>
export type UpdateDiscountBodyType = z.infer<typeof UpdateDiscountSchema>
export type UpdateDiscountResBodyType = CreateDiscountBodyResType
export type GetDiscountListType = z.infer<typeof GetDiscountListSchema>
export type GetDiscountListResType = z.infer<typeof GetDiscountListResSchema>
export type GetDiscountParamsType = z.infer<typeof GetDiscountParamsSchema>
export type ApplyDiscountType = z.infer<typeof ApplyDiscountSchema>
export type PreviewDiscountType = z.infer<typeof PreviewDiscountSchema>
export type PreviewDiscountResType = z.infer<typeof PreviewDiscountResSchema>
