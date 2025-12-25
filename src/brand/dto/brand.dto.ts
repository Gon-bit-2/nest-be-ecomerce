import { createZodDto } from 'nestjs-zod'
import {
  CreateBrandBodySchema,
  GetBrandDetailsResSchema,
  GetBrandParamsSchema,
  GetBrandsResSchema,
} from 'src/brand/brand.model'

export class GetBrandResDTO extends createZodDto(GetBrandsResSchema) {}
export class GetBrandDetailResDTO extends createZodDto(GetBrandDetailsResSchema) {}
export class GetBrandParamsDTO extends createZodDto(GetBrandParamsSchema) {}
export class CreateBrandBodyDTO extends createZodDto(CreateBrandBodySchema) {}
