import { PermissionSchema } from 'src/shared/model/share-permission.model'
import { RoleSchema } from 'src/shared/model/share-role.model'
import z from 'zod'

export const RoleWithPermissionSchema = RoleSchema.extend({
  permissions: z.array(PermissionSchema),
})

export const GetRoleResSchema = z.object({
  data: z.array(RoleSchema),
  totalItems: z.number(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
  totalPages: z.number(),
})

export const GetRoleQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(10),
  })
  .strict()
export const GetRoleParamsSchema = z
  .object({
    roleId: z.coerce.number(),
  })
  .strict()
export const GetRoleDetailResSchema = RoleWithPermissionSchema

export const CreateRoleBodySchema = RoleSchema.pick({
  name: true,
  description: true,
  isActive: true,
}).strict()

export const CreateRoleResSchema = RoleSchema

export const UpdateRoleBodySchema = RoleSchema.pick({
  name: true,
  description: true,
  isActive: true,
})
  .extend({
    permissionIds: z.array(z.number()),
  })
  .strict()

export type RoleWithPermissionType = z.infer<typeof RoleWithPermissionSchema>
export type GetRoleResType = z.infer<typeof GetRoleResSchema>
export type GetRoleDetailResType = z.infer<typeof GetRoleDetailResSchema>
export type CreateRoleResType = z.infer<typeof CreateRoleResSchema>
export type CreateRoleBodyType = z.infer<typeof CreateRoleBodySchema>
export type GetRoleQueryType = z.infer<typeof GetRoleQuerySchema>
export type GetRoleParamsType = z.infer<typeof GetRoleParamsSchema>
export type UpdateRoleBodyType = z.infer<typeof UpdateRoleBodySchema>
