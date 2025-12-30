/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import z from 'zod'
import { SKUSchema, UpsertSKUBodySchema, UpsertSKUBodySchemaType } from './sku.model'
import { ProductTranslationSchema } from './product-translation/product-translation.model'
import { CategoryIncludeTranslationSchema } from 'src/shared/model/share-category.model'
import { BrandIncludeTranslationsSchema } from 'src/shared/model/share-brand.model'

function generateSKUs(variants: VariantsType): UpsertSKUBodySchemaType[] {
  function getCombinations(arrays: string[][]) {
    return arrays.reduce(
      (acc, curr) => {
        return acc.flatMap((x) => {
          return curr.map((y) => `${x}${x ? '-' : ''}${y}`)
        })
      },
      [''],
    )
  }
  const options = variants.map((variant) => variant.options)
  const combinations = getCombinations(options)

  // 3. Map các tổ hợp string thành object SKU hoàn chỉnh
  return combinations.map((value) => ({
    value: value,
    price: 0,
    stock: 100, // TODO: set default stock
    image: '',
  }))
}
export const VariantSchema = z.object({
  value: z.string(),
  options: z.array(z.string()),
})
export const VariantsSchema = z.array(VariantSchema).superRefine((variants, ctx) => {
  //kiem tra variants va variant option co bi trung hay khong
  for (let i = 9; i < variants.length; i++) {
    const variant = variants[i]
    const isDifferent = variants.findIndex((v) => v.value === variant.value) !== i
    if (!isDifferent) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Giá trị ${variant.value} đã tồn tại trong danh sách variants`,
        path: ['variants'],
      })
    }
    const isDifferentOption = variant.options.findIndex((o) => variant.options.includes(o)) !== -1
    if (!isDifferentOption) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Variants ${variant.value} chứa các option trùng tên với nhau`,
        path: ['variants'],
      })
    }
  }
})

export const ProductSchema = z.object({
  id: z.number(),
  publishedAt: z.coerce.date().nullable(),
  name: z.string(),
  basePrice: z.number(),
  virtualPrice: z.number(),
  brandId: z.number(),
  images: z.array(z.string()),
  variants: VariantsSchema,

  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
})

export const GetProductsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
  name: z.string().optional(),
  brandId: z.array(z.coerce.number().int().positive()).optional(),
  categories: z.array(z.coerce.number().int().positive()).optional(),
  minPrice: z.coerce.number().int().positive().optional(),
  maxPrice: z.coerce.number().int().positive().optional(),
})

export const GetProductsResSchema = z.object({
  data: z.array(
    ProductSchema.extend({
      productTranslations: z.array(ProductTranslationSchema),
    }),
  ),
  totalItems: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
})

export const GetProductParamsSchema = z
  .object({
    productId: z.coerce.number().int().positive(),
  })
  .strict()

export const GetProductDetailResSchema = ProductSchema.extend({
  productTranslations: z.array(ProductTranslationSchema),
  skus: z.array(SKUSchema),
  categories: z.array(CategoryIncludeTranslationSchema),
  brand: BrandIncludeTranslationsSchema,
})

export const CreateProductBodySchema = ProductSchema.pick({
  publishedAt: true,
  name: true,
  basePrice: true,
  virtualPrice: true,
  brandId: true,
  images: true,
  variants: true,
})
  .extend({
    categories: z.array(z.coerce.number().int().positive()),
    skus: z.array(UpsertSKUBodySchema),
  })
  .strict()
  .superRefine(({ variants, skus }, ctx) => {
    const skuValueArray = generateSKUs(variants)
    //check số lượng sku có hợp lệ không
    if (skus.length !== skuValueArray.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Số lượng SKU không hợp lệ, nó nên là ${skuValueArray.length}`,
        path: ['skus'],
      })
    }
    let wrongSKUIndex = -1
    const isValidSKUs = skus.every((sku, index) => {
      const isValid = sku.value === skuValueArray[index].value
      if (!isValid) {
        wrongSKUIndex = index
      }
      return isValid
    })
    if (!isValidSKUs) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `SKU index: ${wrongSKUIndex} không hợp lệ`,
        path: ['skus'],
      })
    }
  })

export const UpdateProductBodySchema = CreateProductBodySchema

export type ProductType = z.infer<typeof ProductSchema>
export type VariantsType = z.infer<typeof VariantsSchema>
export type GetProductsQueryType = z.infer<typeof GetProductsQuerySchema>
export type GetProductsResType = z.infer<typeof GetProductsResSchema>
export type GetProductParamsType = z.infer<typeof GetProductParamsSchema>
export type GetProductDetailResType = z.infer<typeof GetProductDetailResSchema>
export type CreateProductBodyType = z.infer<typeof CreateProductBodySchema>
export type UpdateProductBodyType = z.infer<typeof UpdateProductBodySchema>
