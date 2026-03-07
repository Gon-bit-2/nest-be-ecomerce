import { createZodDto } from 'nestjs-zod'
import {
  CreateAddressBodySchema,
  GetAddressDetailResSchema,
  GetAddressListResSchema,
  GetAddressParamsSchema,
  SetDefaultAddressResSchema,
  UpdateAddressBodySchema,
} from '../address.model'

export class GetAddressListResDTO extends createZodDto(GetAddressListResSchema) {}

export class GetAddressDetailResDTO extends createZodDto(GetAddressDetailResSchema) {}

export class GetAddressParamsDTO extends createZodDto(GetAddressParamsSchema) {}

export class CreateAddressBodyDTO extends createZodDto(CreateAddressBodySchema) {}

export class UpdateAddressBodyDTO extends createZodDto(UpdateAddressBodySchema) {}

export class SetDefaultAddressResDTO extends createZodDto(SetDefaultAddressResSchema) {}
