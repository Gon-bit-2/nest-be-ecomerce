import z from 'zod'
import { CategoryIncludeTranslationSchema, CategorySchema } from 'src/shared/model/share-category.model'

export const GetAllCategoriesResSchema = z.object({
  data: z.array(CategorySchema),
  totalItems: z.number(),
})

export const GetAllCategoriesQuerySchema = z.object({
  parentCategoryId: z.coerce.number().int().positive().optional(),
})

export const GetCategoryParamsSchema = z
  .object({
    id: z.coerce.number().int().positive(),
  })
  .strict()

export const GetCategoryDetailResSchema = CategoryIncludeTranslationSchema

export const CreatCategoryBodySchema = z
  .object({
    name: CategorySchema.shape.name,
    logo: CategorySchema.shape.logo,
    parentCategoryId: CategorySchema.shape.parentCategoryId.optional(),
  })
  .strict()
export const UpdateCategoryBodySchema = CreatCategoryBodySchema

export type CategoryType = z.infer<typeof CategorySchema>
export type CategoryIncludeTranslationType = z.infer<typeof CategoryIncludeTranslationSchema>
export type GetAllCategoriesResType = z.infer<typeof GetAllCategoriesResSchema>
export type GetAllCategoriesQueryType = z.infer<typeof GetAllCategoriesQuerySchema>
export type GetCategoryParamsType = z.infer<typeof GetCategoryParamsSchema>
export type GetCategoryDetailResType = z.infer<typeof GetCategoryDetailResSchema>
export type CreateCategoryBodyType = z.infer<typeof CreatCategoryBodySchema>
export type UpdateCategoryBodyType = z.infer<typeof UpdateCategoryBodySchema>
