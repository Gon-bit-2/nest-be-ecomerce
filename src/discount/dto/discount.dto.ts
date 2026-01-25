import { createZodDto } from 'nestjs-zod'
import {
  ApplyDiscountSchema,
  CreateDiscountResSchema,
  CreateDiscountSchema,
  DiscountSchema,
  GetDiscountListResSchema,
  GetDiscountListSchema,
  GetDiscountParamsSchema,
  UpdateDiscountSchema,
} from '../model/discount.model'

export class DiscountDTO extends createZodDto(DiscountSchema) {}
export class CreateDiscountBodyDTO extends createZodDto(CreateDiscountSchema) {}
export class CreateDiscountResBodyDTO extends createZodDto(CreateDiscountResSchema) {}
export class UpdateDiscountBodyDTO extends createZodDto(UpdateDiscountSchema) {}
export class UpdateDiscountResBodyDTO extends CreateDiscountResBodyDTO {}
export class GetDiscountListDTO extends createZodDto(GetDiscountListSchema) {}
export class GetDiscountListResDTO extends createZodDto(GetDiscountListResSchema) {}
export class ApplyDiscountDTO extends createZodDto(ApplyDiscountSchema) {}
export class GetDiscountParamsDTO extends createZodDto(GetDiscountParamsSchema) {}
