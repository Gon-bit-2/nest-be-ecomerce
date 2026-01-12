import { Injectable } from '@nestjs/common'
import { SKUSchemaType } from 'src/shared/model/shared-sku.model'
import { PrismaService } from 'src/shared/service/prisma.service'
import { NotFoundSKUException, OutOfStockSKUException, ProductNotFoundException } from '../error/cart.error'
import { ALL_LANGUAGE_CODE } from 'src/shared/constants/other.constant'
import {
  AddCartBodyType,
  CartItemType,
  DeleteCartBodyType,
  GetCartResType,
  UpdateCartBodyType,
  CartItemDetailType,
} from '../cart.model'
import { Prisma } from '@prisma/client'

@Injectable()
export class CartRepo {
  constructor(private readonly prismaService: PrismaService) {}

  private async validateSKU(skuId: number): Promise<SKUSchemaType> {
    const sku = await this.prismaService.sKU.findUnique({
      where: {
        id: skuId,
        deletedAt: null,
      },
      include: {
        product: true,
      },
    })
    //kiểm tra tồn tại
    if (!sku) {
      throw NotFoundSKUException
    }
    //kiểm tra tồn kho
    if (sku.stock < 1) {
      throw OutOfStockSKUException
    }
    const { product } = sku
    //kiểm tra sản phẩm đã bị xóa hoặc có công khai không
    if (
      product.deletedAt !== null ||
      product.publishedAt === null ||
      (product.publishedAt !== null && product.publishedAt > new Date())
    ) {
      throw ProductNotFoundException
    }
    return sku
  }
  async findAll({
    userId,
    languageId,
    limit = 10,
    page = 1,
  }: {
    userId: number
    languageId: string
    limit: number
    page: number
  }): Promise<GetCartResType> {
    const cartItems = await this.prismaService.cartItem.findMany({
      where: {
        userId,
        sku: {
          product: {
            deletedAt: null,
            publishedAt: {
              lte: new Date(),
              not: null,
            },
          },
        },
      },
      include: {
        sku: {
          include: {
            product: {
              include: {
                productTranslations: {
                  where:
                    languageId === ALL_LANGUAGE_CODE
                      ? { deletedAt: null }
                      : { deletedAt: null, languageId: languageId },
                },
                createdBy: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    const groupMap = new Map<number, CartItemDetailType>()
    for (const cartItem of cartItems) {
      const shopId = cartItem.sku.product.createdById
      if (shopId) {
        if (!groupMap.has(shopId)) {
          groupMap.set(shopId, {
            shop: cartItem.sku.product.createdBy,
            cartItems: [],
          })
        }
        groupMap.get(shopId)?.cartItems.push(cartItem)
      }
    }
    const sortedGroups = Array.from(groupMap.values())
    const skip = (page - 1) * limit
    const take = limit
    const totalGroups = sortedGroups.length
    const pagedGroups = sortedGroups.slice(skip, skip + take)
    return {
      data: pagedGroups,
      limit,
      page,
      totalItems: totalGroups,
      totalPages: Math.ceil(totalGroups / limit),
    }
  }
  async findAll2({
    userId,
    languageId,
    page,
    limit,
  }: {
    userId: number
    languageId: string
    limit: number
    page: number
  }): Promise<GetCartResType> {
    const skip = (page - 1) * limit
    const take = limit
    // Đếm tổng số nhóm sản phẩm
    const totalItems$ = this.prismaService.$queryRaw<{ createdById: number }[]>`
      SELECT
        "Product"."createdById"
      FROM "CartItem"
      JOIN "SKU" ON "CartItem"."skuId" = "SKU"."id"
      JOIN "Product" ON "SKU"."productId" = "Product"."id"
      WHERE "CartItem"."userId" = ${userId}
        AND "Product"."deletedAt" IS NULL
        AND "Product"."publishedAt" IS NOT NULL
        AND "Product"."publishedAt" <= NOW()
      GROUP BY "Product"."createdById"
    `
    const data$ = await this.prismaService.$queryRaw<CartItemDetailType[]>`
     SELECT
       "Product"."createdById",
       json_agg(
         jsonb_build_object(
           'id', "CartItem"."id",
           'quantity', "CartItem"."quantity",
           'skuId', "CartItem"."skuId",
           'userId', "CartItem"."userId",
           'createdAt', "CartItem"."createdAt",
           'updatedAt', "CartItem"."updatedAt",
           'sku', jsonb_build_object(
             'id', "SKU"."id",
              'value', "SKU"."value",
              'price', "SKU"."price",
              'stock', "SKU"."stock",
              'image', "SKU"."image",
              'productId', "SKU"."productId",
              'product', jsonb_build_object(
                'id', "Product"."id",
                'publishedAt', "Product"."publishedAt",
                'name', "Product"."name",
                'basePrice', "Product"."basePrice",
                'virtualPrice', "Product"."virtualPrice",
                'brandId', "Product"."brandId",
                'images', "Product"."images",
                'variants', "Product"."variants",
                'productTranslations', COALESCE((
                  SELECT json_agg(
                    jsonb_build_object(
                      'id', pt."id",
                      'productId', pt."productId",
                      'languageId', pt."languageId",
                      'name', pt."name",
                      'description', pt."description"
                    )
                  ) FILTER (WHERE pt."id" IS NOT NULL)
                  FROM "ProductTranslation" pt
                  WHERE pt."productId" = "Product"."id"
                    AND pt."deletedAt" IS NULL
                    ${languageId === ALL_LANGUAGE_CODE ? Prisma.sql`` : Prisma.sql`AND pt."languageId" = ${languageId}`}
                ), '[]'::json)
              )
           )
         )
       ) AS "cartItems",
       jsonb_build_object(
         'id', "User"."id",
         'name', "User"."name",
         'avatar', "User"."avatar"
       ) AS "shop"
     FROM "CartItem"
     JOIN "SKU" ON "CartItem"."skuId" = "SKU"."id"
     JOIN "Product" ON "SKU"."productId" = "Product"."id"
     LEFT JOIN "ProductTranslation" ON "Product"."id" = "ProductTranslation"."productId"
       AND "ProductTranslation"."deletedAt" IS NULL
       ${languageId === ALL_LANGUAGE_CODE ? Prisma.sql`` : Prisma.sql`AND "ProductTranslation"."languageId" = ${languageId}`}
     LEFT JOIN "User" ON "Product"."createdById" = "User"."id"
     WHERE "CartItem"."userId" = ${userId}
        AND "Product"."deletedAt" IS NULL
        AND "Product"."publishedAt" IS NOT NULL
        AND "Product"."publishedAt" <= NOW()
     GROUP BY "Product"."createdById", "User"."id"
     ORDER BY MAX("CartItem"."updatedAt") DESC
      LIMIT ${take}
      OFFSET ${skip}
   `
    const [data, totalItems] = await Promise.all([data$, totalItems$])
    return {
      data,
      page,
      limit,
      totalItems: totalItems.length,
      totalPages: Math.ceil(totalItems.length / limit),
    }
  }
  async create(userId: number, body: AddCartBodyType): Promise<CartItemType> {
    const { skuId, quantity } = body
    await this.validateSKU(skuId)
    const cartItem = await this.prismaService.cartItem.create({
      data: {
        userId,
        skuId,
        quantity,
      },
    })
    return cartItem
  }

  async update(cartItemId: number, body: UpdateCartBodyType): Promise<CartItemType> {
    await this.validateSKU(body.skuId)
    const updateCartItems = await this.prismaService.cartItem.update({
      where: {
        id: cartItemId,
      },
      data: {
        quantity: body.quantity,
      },
    })
    return updateCartItems
  }
  async delete(userId: number, body: DeleteCartBodyType) {
    return await this.prismaService.cartItem.deleteMany({
      where: {
        userId,
        id: {
          in: body.cartItemIds,
        },
      },
    })
  }
}
