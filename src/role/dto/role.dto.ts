import { createZodDto } from 'nestjs-zod'
import {
  CreateRoleBodySchema,
  GetRoleDetailResSchema,
  GetRoleParamsSchema,
  GetRoleQuerySchema,
  GetRoleResSchema,
  UpdateRoleBodySchema,
} from '../role.model'
export class GetRoleResDto extends createZodDto(GetRoleResSchema) {}
export class GetRoleQueryDto extends createZodDto(GetRoleQuerySchema) {}

export class GetRoleParamsDto extends createZodDto(GetRoleParamsSchema) {}

export class GetRoleDetailResDto extends createZodDto(GetRoleDetailResSchema) {}

export class CreateRoleBodyDto extends createZodDto(CreateRoleBodySchema) {}

export class UpdateRoleBodyDto extends createZodDto(UpdateRoleBodySchema) {}
