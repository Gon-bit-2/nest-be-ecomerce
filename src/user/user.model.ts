import { RoleSchema } from 'src/shared/model/share-role.model'
import { UserSchema } from 'src/shared/model/shared-user.model'
import z from 'zod'

export const GetUserResSchema = z.object({
  data: z.array(
    UserSchema.omit({
      password: true,
      totpSecret: true,
    }).extend({
      role: RoleSchema.pick({
        id: true,
        name: true,
      }),
    }),
  ),
  totalItem: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
})

export const GetUsersQuerySchema = z
  .object({
    page: z.coerce.number().optional().default(1),
    limit: z.coerce.number().optional().default(10),
  })
  .strict()
export const GetUserParamsSchema = z
  .object({
    userId: z.coerce.number().int().positive(),
  })
  .strict()
export const CreateUserBodySchema = UserSchema.pick({
  email: true,
  name: true,
  phoneNumber: true,
  avatar: true,
  status: true,
  password: true,
  roleId: true,
}).strict()
export const UpdateUserBodySchema = CreateUserBodySchema

export type GetUserResType = z.infer<typeof GetUserResSchema>
export type GetUsersQueryType = z.infer<typeof GetUsersQuerySchema>
export type GetUserParamsType = z.infer<typeof GetUserParamsSchema>
export type CreateUserBodyType = z.infer<typeof CreateUserBodySchema>
export type UpdateUserBodyType = z.infer<typeof UpdateUserBodySchema>
