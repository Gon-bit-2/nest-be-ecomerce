import z from 'zod'
import { UpsertSKUBodySchema, UpsertSKUBodySchemaType } from './sku.model'
import { CategoryIncludeTranslationSchema } from 'src/shared/model/share-category.model'
import { BrandIncludeTranslationsSchema } from 'src/shared/model/share-brand.model'
import { ORDER_BY, SORT_BY } from 'src/shared/constants/other.constant'
import { ProductSchema, VariantsType } from 'src/shared/model/shared-product.model'
import { SKUSchema } from 'src/shared/model/shared-sku.model'
import { ProductTranslationSchema } from 'src/shared/model/shared-product-translation.model'

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

/**
 * dành cho client và guest
 */
export const GetProductsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
  name: z.string().optional(),
  brandIds: z.preprocess((value) => {
    if (typeof value === 'string') {
      return [Number(value)]
    }
    return value
  }, z.array(z.coerce.number().int().positive()).optional()),
  categories: z.preprocess((value) => {
    if (typeof value === 'string') {
      return [Number(value)]
    }
    return value
  }, z.array(z.coerce.number().int().positive()).optional()),
  minPrice: z.coerce.number().int().positive().optional(),
  maxPrice: z.coerce.number().int().positive().optional(),
  createdById: z.coerce.number().int().positive().optional(),
  orderBy: z.enum([ORDER_BY.ASC, ORDER_BY.DESC]).default(ORDER_BY.DESC),
  sortBy: z.enum([SORT_BY.PRICE, SORT_BY.CREATED_AT, SORT_BY.SALE]).default(SORT_BY.CREATED_AT),
})

/**
 * dành cho admin và seller
 */
export const GetManageProductQuerySchema = GetProductsQuerySchema.extend({
  isPublic: z.preprocess((value) => value === 'true', z.boolean()).optional(),
  createdById: z.coerce.number().int().positive(),
})

export const SearchProductQuerySchema = z.object({
  q: z.string(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
  orderBy: z.enum([ORDER_BY.ASC, ORDER_BY.DESC]).default(ORDER_BY.DESC),
  sortBy: z.enum([SORT_BY.PRICE, SORT_BY.CREATED_AT, SORT_BY.SALE]).default(SORT_BY.CREATED_AT),
})

export const GetProductsResSchema = z.object({
  data: z.array(
    ProductSchema.extend({
      productTranslations: z.array(ProductTranslationSchema),
      sold: z.number().default(0),
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
  sold: z.number().default(0),
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
    publishedAt: z.string().datetime().nullable().optional(), // Override kiểu Date thành string
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

export type GetProductsQueryType = z.infer<typeof GetProductsQuerySchema>
export type SearchProductQueryType = z.infer<typeof SearchProductQuerySchema>
export type GetManageProductQueryType = z.infer<typeof GetManageProductQuerySchema>
export type GetProductsResType = z.infer<typeof GetProductsResSchema>
export type GetProductParamsType = z.infer<typeof GetProductParamsSchema>
export type GetProductDetailResType = z.infer<typeof GetProductDetailResSchema>
export type CreateProductBodyType = z.infer<typeof CreateProductBodySchema>
export type UpdateProductBodyType = z.infer<typeof UpdateProductBodySchema>
