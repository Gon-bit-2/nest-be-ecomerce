import { createZodDto } from 'nestjs-zod'
import {
  CreatePermissionBodySchema,
  GetPermissionDetailResSchema,
  GetPermissionParamsSchema,
  GetPermissionResSchema,
  GetPermissionsQuerySchema,
  UpdatePermissionBodySchema,
} from '../permission.model'

export class GetPermissionResDTO extends createZodDto(GetPermissionResSchema) {}
export class GetPermissionsQueryDTO extends createZodDto(GetPermissionsQuerySchema) {}
export class GetPermissionParamsDTO extends createZodDto(GetPermissionParamsSchema) {}
export class GetPermissionDetailResDTO extends createZodDto(GetPermissionDetailResSchema) {}
export class CreatePermissionBodyDTO extends createZodDto(CreatePermissionBodySchema) {}
export class UpdatePermissionBodyDTO extends createZodDto(UpdatePermissionBodySchema) {}
