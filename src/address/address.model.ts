import z from 'zod'

export const UserAddressSchema = z.object({
  id: z.number(),
  userId: z.number(),
  name: z.string().max(500),
  phone: z.string().max(50),
  address: z.string().max(1000),
  isDefault: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const GetAddressListResSchema = z.object({
  data: z.array(UserAddressSchema),
})

export const GetAddressDetailResSchema = UserAddressSchema

export const GetAddressParamsSchema = z
  .object({
    addressId: z.coerce.number().int().positive(),
  })
  .strict()

export const CreateAddressBodySchema = z
  .object({
    name: z.string().min(1).max(500),
    phone: z.string().min(1).max(50),
    address: z.string().min(1).max(1000),
    isDefault: z.boolean().optional().default(false),
  })
  .strict()

export const UpdateAddressBodySchema = z
  .object({
    name: z.string().min(1).max(500).optional(),
    phone: z.string().min(1).max(50).optional(),
    address: z.string().min(1).max(1000).optional(),
    isDefault: z.boolean().optional(),
  })
  .strict()

export const SetDefaultAddressResSchema = UserAddressSchema

export type UserAddressType = z.infer<typeof UserAddressSchema>
export type GetAddressListResType = z.infer<typeof GetAddressListResSchema>
export type GetAddressDetailResType = z.infer<typeof GetAddressDetailResSchema>
export type GetAddressParamsType = z.infer<typeof GetAddressParamsSchema>
export type CreateAddressBodyType = z.infer<typeof CreateAddressBodySchema>
export type UpdateAddressBodyType = z.infer<typeof UpdateAddressBodySchema>
