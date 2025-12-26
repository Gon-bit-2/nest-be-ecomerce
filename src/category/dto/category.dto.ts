import { createZodDto } from 'nestjs-zod'
import {
  CreatCategoryBodySchema,
  GetAllCategoriesQuerySchema,
  GetAllCategoriesResSchema,
  GetCategoryDetailResSchema,
  GetCategoryParamsSchema,
  UpdateCategoryBodySchema,
} from '../category.model'

export class GetAllCategoriesResDTO extends createZodDto(GetAllCategoriesResSchema) {}
export class GetAllCategoriesQueryDTO extends createZodDto(GetAllCategoriesQuerySchema) {}
export class GetCategoryParamsDTO extends createZodDto(GetCategoryParamsSchema) {}
export class GetCategoryDetailResDTO extends createZodDto(GetCategoryDetailResSchema) {}
export class CreateCategoryDTO extends createZodDto(CreatCategoryBodySchema) {}
export class UpdateCategoryDTO extends createZodDto(UpdateCategoryBodySchema) {}
