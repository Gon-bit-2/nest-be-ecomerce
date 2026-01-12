import { ProductTranslationSchema } from 'src/shared/model/shared-product-translation.model'
import z from 'zod'

export const GetProductTranslationParamsSchema = z
  .object({
    productTranslationId: z.coerce.number().int().positive(),
  })
  .strict()

export const GetProductTranslationDetailSchema = ProductTranslationSchema

export const CreateProductTranslationBodySchema = ProductTranslationSchema.pick({
  productId: true,
  languageId: true,
  name: true,
  description: true,
}).strict()

export const UpdateProductTranslationBodySchema = CreateProductTranslationBodySchema
export const DeleteProductTranslationParamsSchema = GetProductTranslationParamsSchema

export type GetProductTranslationParamsType = z.infer<typeof GetProductTranslationParamsSchema>
export type GetProductTranslationDetailType = z.infer<typeof GetProductTranslationDetailSchema>
export type CreateProductTranslationBodyType = z.infer<typeof CreateProductTranslationBodySchema>
export type UpdateProductTranslationBodyType = z.infer<typeof UpdateProductTranslationBodySchema>
export type DeleteProductTranslationParamsType = z.infer<typeof DeleteProductTranslationParamsSchema>
