import z from 'zod'
import { CategoryTranslationSchema } from 'src/shared/model/share-category-translation.model'

export const GetCategoryTranslationParamsSchema = z
  .object({
    categoryTranslationId: z.coerce.number().int().positive(),
  })
  .strict()

export const GetCategoryTranslationDetailSchema = CategoryTranslationSchema

export const CreateCategoryTranslationBodySchema = CategoryTranslationSchema.pick({
  categoryId: true,
  languageId: true,
  name: true,
  description: true,
}).strict()

export const UpdateCategoryTranslationBodySchema = CreateCategoryTranslationBodySchema

export type CategoryTranslationType = z.infer<typeof CategoryTranslationSchema>
export type GetCategoryTranslationParamsType = z.infer<typeof GetCategoryTranslationParamsSchema>
export type GetCategoryTranslationDetailType = z.infer<typeof GetCategoryTranslationDetailSchema>
export type CreateCategoryTranslationBodyType = z.infer<typeof CreateCategoryTranslationBodySchema>
export type UpdateCategoryTranslationBodyType = z.infer<typeof UpdateCategoryTranslationBodySchema>
