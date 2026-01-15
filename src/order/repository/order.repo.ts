import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from 'src/shared/service/prisma.service'
import {
  CancelOrderResType,
  CreateOrderBodyResType,
  CreateOrderBodyType,
  GetOrderDetailResType,
  GetOrderListQueryType,
} from '../order.model'
import {
  CanNotCancelOrderException,
  NotFoundCartItemException,
  OrdetNotFoundException,
  OutOfStockSKUException,
  SKUNotBeLongToShopException,
} from '../order.error'
import { ORDER_STATUS } from 'src/shared/constants/order.constant'
import { PAYMENT_STATUS } from 'src/shared/constants/payment.constant'

@Injectable()
export class OrderRepo {
  constructor(private readonly prismaService: PrismaService) {}

  async list(userId: number, query: GetOrderListQueryType) {
    const { limit, page, status } = query
    const skip = (page - 1) * limit
    const take = limit
    const where: Prisma.OrderWhereInput = {
      userId,
      status,
    }
    const data$ = await this.prismaService.order.findMany({
      where,
      include: {
        items: true,
      },
      take,
      skip,
      orderBy: {
        createdAt: 'desc',
      },
    })
    const totalItem$ = await this.prismaService.order.count({
      where,
    })
    const [data, totalItems] = await Promise.all([data$, totalItem$])
    return {
      data,
      totalItems,
      limit,
      page,
      totalPages: Math.ceil(totalItems / limit),
    }
  }
  async create(userId: number, body: CreateOrderBodyType): Promise<CreateOrderBodyResType> {
    //1. kiểm tra xem all cartItems có tồn tại in db
    const allBodyCartItemIds = body.map((item) => item.cartItemIds).flat()
    const cartItems = await this.prismaService.cartItem.findMany({
      where: {
        id: {
          in: allBodyCartItemIds,
        },
        userId,
      },
      include: {
        sku: {
          include: {
            product: {
              include: {
                productTranslations: true,
              },
            },
          },
        },
      },
    })
    if (cartItems.length !== allBodyCartItemIds.length) {
      throw NotFoundCartItemException
    }
    //2. kiểm tra số lượng mua có lớn hơn ? sl tồn
    const isOutOfStock = cartItems.some((item) => {
      return item.sku.stock < item.quantity
    })
    if (isOutOfStock) {
      throw OutOfStockSKUException
    }
    //3. kiểm tra sản phẩm mua có sp đã bị xóa hay ẩn
    const isExitsNotReadyProduct = cartItems.some((item) => {
      return (
        item.sku.product.deletedAt !== null ||
        item.sku.product.publishedAt === null ||
        item.sku.product.publishedAt > new Date()
      )
    })
    if (isExitsNotReadyProduct) {
      throw NotFoundCartItemException
    }
    //4. kiểm tra các skuId trong cartItems gửi lên có thuộc về shopId gửi lên không
    const cartItemMap = new Map<number, (typeof cartItems)[0]>()
    cartItems.forEach((item) => cartItemMap.set(item.id, item))
    const isValidShop = body.every((item) => {
      const bodyCartItemIds = item.cartItemIds
      return bodyCartItemIds.every((cartItemId) => {
        const cartItem = cartItemMap.get(cartItemId)!
        return item.shopId === cartItem.sku.createdById
      })
    })
    if (!isValidShop) {
      throw SKUNotBeLongToShopException
    }
    //5. Tạo order
    const orders = await this.prismaService.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          status: PAYMENT_STATUS.PENDING,
        },
      })
      const orders$ = Promise.all(
        body.map((item) =>
          tx.order.create({
            data: {
              userId,
              status: ORDER_STATUS.PENDING_PAYMENT,
              shopId: item.shopId,
              receiver: item.receiver,
              createdById: userId,
              paymentId: payment.id,
              items: {
                create: item.cartItemIds.map((cartItemId) => {
                  const cartItem = cartItemMap.get(cartItemId)!
                  return {
                    productName: cartItem.sku.product.name,
                    skuPrice: cartItem.sku.price,
                    image: cartItem.sku.image,
                    skuId: cartItem.sku.id,
                    skuValue: cartItem.sku.value,
                    quantity: cartItem.quantity,
                    productId: cartItem.sku.productId,
                    productTranslations: cartItem.sku.product.productTranslations.map((translation) => {
                      return {
                        id: translation.id,
                        name: translation.name,
                        description: translation.description,
                        languageId: translation.languageId,
                      }
                    }),
                  }
                }),
              },
              product: {
                connect: item.cartItemIds.map((cartItemId) => {
                  const cartItem = cartItemMap.get(cartItemId)!
                  return {
                    id: cartItem.sku.productId,
                  }
                }),
              },
            },
          }),
        ),
      )
      const cartItem$ = tx.cartItem.deleteMany({
        where: {
          id: {
            in: allBodyCartItemIds,
          },
        },
      })
      const sku$ = Promise.all(
        cartItems.map((item) => {
          return tx.sKU.update({
            where: {
              id: item.sku.id,
            },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          })
        }),
      )
      const [orders] = await Promise.all([orders$, cartItem$, sku$])
      return orders
    })
    return {
      data: orders,
    }
  }
  async detail(userId: number, orderId: number): Promise<GetOrderDetailResType> {
    const order = await this.prismaService.order.findUnique({
      where: {
        id: orderId,
        userId,
        deletedAt: null,
      },
      include: {
        items: true,
      },
    })
    if (!order) {
      throw OrdetNotFoundException
    }
    return order
  }
  async cancel(userId: number, orderId: number): Promise<CancelOrderResType> {
    try {
      const order = await this.prismaService.order.findUniqueOrThrow({
        where: {
          id: orderId,
          userId,
          deletedAt: null,
        },
      })
      if (order.status !== ORDER_STATUS.PENDING_PAYMENT) {
        throw CanNotCancelOrderException
      }
      const updateOrder = await this.prismaService.order.update({
        where: {
          id: orderId,
          userId,
          deletedAt: null,
        },
        data: {
          status: ORDER_STATUS.CANCELLED,
          updatedById: userId,
        },
      })
      return updateOrder
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw OrdetNotFoundException
      }
      throw error
    }
  }
}
