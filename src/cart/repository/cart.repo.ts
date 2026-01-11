import { Injectable } from '@nestjs/common'
import { SKUSchemaType } from 'src/shared/model/shared-sku.model'
import { PrismaService } from 'src/shared/service/prisma.service'
import { NotFoundSKUException, OutOfStockSKUException, ProductNotFoundException } from '../error/cart.error'
import { ALL_LANGUAGE_CODE } from 'src/shared/constants/other.constant'
import { AddCartBodyType, CartItemType, DeleteCartBodyType, GetCartResType, UpdateCartBodyType } from '../cart.model'

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
    const skip = (page - 1) * limit
    const take = limit

    const [data, totalItems] = await Promise.all([
      this.prismaService.cartItem.findMany({
        where: {
          userId,
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
                },
              },
            },
          },
        },
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prismaService.cartItem.count({
        where: {
          userId,
        },
      }),
    ])

    return {
      data,
      limit,
      page,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
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
