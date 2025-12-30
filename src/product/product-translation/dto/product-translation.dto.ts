import { createZodDto } from 'nestjs-zod'
import {
  CreateProductTranslationBodySchema,
  DeleteProductTranslationParamsSchema,
  GetProductTranslationDetailSchema,
  GetProductTranslationParamsSchema,
  UpdateProductTranslationBodySchema,
} from '../product-translation.model'

export class GetProductTranslationDetailResDTO extends createZodDto(GetProductTranslationDetailSchema) {}
export class GetProductTranslationParamsDTO extends createZodDto(GetProductTranslationParamsSchema) {}
export class CreateProductTranslationBodyDTO extends createZodDto(CreateProductTranslationBodySchema) {}
export class UpdateProductTranslationBodyDTO extends createZodDto(UpdateProductTranslationBodySchema) {}
export class DeleteProductTranslationParamsDTO extends createZodDto(DeleteProductTranslationParamsSchema) {}
