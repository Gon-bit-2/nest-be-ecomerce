import z from 'zod'
import { BrandTranslationSchema } from 'src/shared/model/share-brand-translation.model'

export const GetBrandTranslationParamsSchema = z
  .object({
    brandTranslationId: z.coerce.number().int().positive(),
  })
  .strict()
export const GetBrandTranslationDetailSchema = BrandTranslationSchema
export const CreateBrandTranslationBodySchema = BrandTranslationSchema.pick({
  brandId: true,
  languageId: true,
  name: true,
  description: true,
}).strict()

export const UpdateBrandTranslationBodySchema = CreateBrandTranslationBodySchema

export type BrandTranslationType = z.infer<typeof BrandTranslationSchema>
export type GetBrandTranslationDetailResType = z.infer<typeof GetBrandTranslationDetailSchema>
export type CreateBrandTranslationBodyType = z.infer<typeof CreateBrandTranslationBodySchema>
export type UpdateBrandTranslationBodyType = z.infer<typeof UpdateBrandTranslationBodySchema>
