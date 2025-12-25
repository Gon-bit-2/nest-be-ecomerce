import { createZodDto } from 'nestjs-zod'
import {
  CreateBrandTranslationBodySchema,
  GetBrandTranslationDetailSchema,
  GetBrandTranslationParamsSchema,
  UpdateBrandTranslationBodySchema,
} from 'src/brand/brand-translation/brand-translation.model'

export class GetBrandTranslationDetailResSchema extends createZodDto(GetBrandTranslationDetailSchema) {}
export class GetBrandTranslationParamsDTO extends createZodDto(GetBrandTranslationParamsSchema) {}
export class CreateBrandTranslationBodyDTO extends createZodDto(CreateBrandTranslationBodySchema) {}
export class UpdateBrandTranslationBodyDTO extends createZodDto(UpdateBrandTranslationBodySchema) {}
