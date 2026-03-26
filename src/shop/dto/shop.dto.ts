import { createZodDto } from 'nestjs-zod'
import { GetMyShopResSchema, RegisterShopBodySchema } from '../shop.model'

export class RegisterShopDTO extends createZodDto(RegisterShopBodySchema) {}
export class GetMyShopResDTO extends createZodDto(GetMyShopResSchema) {}
