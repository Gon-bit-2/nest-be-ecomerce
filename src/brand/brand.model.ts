import { BrandIncludeTranslationsSchema, BrandSchema } from 'src/shared/model/share-brand.model'
import z from 'zod'

export const GetBrandsResSchema = z.object({
  data: z.array(BrandIncludeTranslationsSchema),
  totalItems: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
})

export const GetBrandParamsSchema = z
  .object({
    brandId: z.coerce.number().int().positive(),
  })
  .strict()

export const GetBrandDetailsResSchema = BrandIncludeTranslationsSchema

export const CreateBrandBodySchema = BrandSchema.pick({
  name: true,
  logo: true,
}).strict()

export const UpdateBrandBodySchema = CreateBrandBodySchema

export type BrandType = z.infer<typeof BrandSchema>
export type BrandIncludeTranslationsType = z.infer<typeof BrandIncludeTranslationsSchema>
export type GetBrandsResType = z.infer<typeof GetBrandsResSchema>
export type GetBrandDetailsResType = z.infer<typeof GetBrandDetailsResSchema>
export type CreateBrandBodyType = z.infer<typeof CreateBrandBodySchema>
export type UpdateBrandBodyType = z.infer<typeof UpdateBrandBodySchema>
export type GetBrandParamsType = z.infer<typeof GetBrandParamsSchema>
