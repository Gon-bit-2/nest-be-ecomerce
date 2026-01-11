import { SKUSchema } from 'src/shared/model/shared-sku.model'
import z from 'zod'

export const UpsertSKUBodySchema = SKUSchema.pick({
  value: true,
  price: true,
  stock: true,
  image: true,
})

export type SKUSchemaType = z.infer<typeof SKUSchema>
export type UpsertSKUBodySchemaType = z.infer<typeof UpsertSKUBodySchema>
