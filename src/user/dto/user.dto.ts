import { createZodDto } from 'nestjs-zod'
import {
  CreateUserBodySchema,
  GetUserParamsSchema,
  GetUserResSchema,
  GetUsersQuerySchema,
  UpdateUserBodySchema,
} from '../user.model'
import { UserSchema } from 'src/shared/model/shared-user.model'

export class GetUsersResDTO extends createZodDto(GetUserResSchema) {}
export class GetUsersQueryDTO extends createZodDto(GetUsersQuerySchema) {}
export class GetUserParamsDTO extends createZodDto(GetUserParamsSchema) {}
export class CreateUserBodyDTO extends createZodDto(CreateUserBodySchema) {}
export class UpdateUserBodyDTO extends createZodDto(UpdateUserBodySchema) {}
// export class CreateUserResDTO extends UpdateUserProfileResDTO {}
export class CreateUserResDTO extends createZodDto(
  UserSchema.omit({
    password: true,
    totpSecret: true,
  }),
) {}

export class UpdateUserResDTO extends CreateUserResDTO {}
