import z from 'zod'

export const ProductTranslationSchema = z.object({
  id: z.number(),
  productId: z.number(),
  languageId: z.string(),
  name: z.string(),
  description: z.string(),

  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
})

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

export type ProductTranslationType = z.infer<typeof ProductTranslationSchema>
export type GetProductTranslationParamsType = z.infer<typeof GetProductTranslationParamsSchema>
export type GetProductTranslationDetailType = z.infer<typeof GetProductTranslationDetailSchema>
export type CreateProductTranslationBodyType = z.infer<typeof CreateProductTranslationBodySchema>
export type UpdateProductTranslationBodyType = z.infer<typeof UpdateProductTranslationBodySchema>
export type DeleteProductTranslationParamsType = z.infer<typeof DeleteProductTranslationParamsSchema>
