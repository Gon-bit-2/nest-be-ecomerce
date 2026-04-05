import { createZodDto } from 'nestjs-zod'
import { GetMyShopResSchema, RegisterShopBodySchema, GetShopStatisticsResSchema } from '../shop.model'

export class RegisterShopDTO extends createZodDto(RegisterShopBodySchema) {}
export class GetMyShopResDTO extends createZodDto(GetMyShopResSchema) {}
export class GetShopStatisticsResDTO extends createZodDto(GetShopStatisticsResSchema) {}
