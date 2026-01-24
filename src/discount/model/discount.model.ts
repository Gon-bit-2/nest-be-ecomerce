import z from 'zod'
import { DISCOUNT_APPLY_TO, DISCOUNT_SCOPE, DISCOUNT_TYPE } from 'src/shared/constants/discount.constant'

export const DiscountSchema = z.object({
  id: z.number(),
  shopId: z.number().optional(),
  productIds: z.array(z.number()).default([]),
  categoryIds: z.array(z.number()).default([]),
  userId: z.number().optional(),
  name: z.string().min(1, 'Name is required'),
  value: z.number().min(1, 'Value is required'),
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
  name: true,
  value: true,
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
}).refine((data) => data.endDate >= data.startDate, {
  message: 'End date must be greater than start date',
  path: ['endDate'],
})

export const UpdateDiscountSchema = CreateDiscountSchema
export const GetDiscountListResSchema = z.object({
  data: z.array(
    DiscountSchema.pick({
      id: true,
      shopId: true,
      name: true,
      value: true,
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
export const ApplyDiscountSchema = z.object({
  code: z.string(),
  orderValue: z.number(),
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

export type DiscountType = z.infer<typeof DiscountSchema>
export type CreateDiscountType = z.infer<typeof CreateDiscountSchema>
export type UpdateDiscountType = z.infer<typeof UpdateDiscountSchema>
export type GetDiscountListType = z.infer<typeof GetDiscountListSchema>
export type GetDiscountListResType = z.infer<typeof GetDiscountListResSchema>
export type ApplyDiscountType = z.infer<typeof ApplyDiscountSchema>
