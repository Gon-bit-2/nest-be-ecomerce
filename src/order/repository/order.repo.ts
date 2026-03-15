import { BadRequestException, Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from 'src/shared/service/prisma.service'
import {
  CancelOrderResType,
  CreateOrderBodyResType,
  ResolvedCreateOrderItem,
  GetOrderDetailResType,
  GetOrderListQueryType,
  UpdateOrderStatusType,
} from '../order.model'
import {
  CanNotCancelOrderException,
  NotFoundCartItemException,
  OrdetNotFoundException,
  OutOfStockSKUException,
  SKUNotBeLongToShopException,
  InvalidOrderStatusTransitionException,
} from '../order.error'
import { ORDER_STATUS } from 'src/shared/constants/order.constant'
import { PAYMENT_STATUS } from 'src/shared/constants/payment.constant'
import { OrderProducer } from '../queue/order.producer'
import { VerionConflictException } from 'src/shared/error/error'

@Injectable()
export class OrderRepo {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly orderProducer: OrderProducer,
  ) {}

  /**
   * Validate discount code and apply it within a transaction.
   * Returns discountAmount (for product discounts) or shippingDiscount (for shipping discounts).
   */
  private async validateAndApplyDiscount(
    tx: Prisma.TransactionClient,
    params: {
      code: string
      userId: number
      orderId: number
      items: { productId: number; categoryIds: number[]; price: number; quantity: number }[]
      shippingFee: number
    },
  ): Promise<{ discountAmount: number; shippingDiscount: number }> {
    const { code, userId, orderId, items, shippingFee } = params
    const orderValue = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

    // 1. Find discount by code
    const discount = await tx.discount.findUnique({
      where: { code, deletedAt: null, isActive: true },
      include: { products: true, categories: true },
    })
    if (!discount) throw new BadRequestException(`Mã "${code}" không tồn tại hoặc không khả dụng`)

    // 2. Check dates
    const now = new Date()
    if (now < discount.startDate || now > discount.endDate) {
      throw new BadRequestException(`Mã "${code}" chưa bắt đầu hoặc đã hết hạn`)
    }

    // 3. Check total usage
    if (discount.maxTotalUses > 0 && discount.useCount >= discount.maxTotalUses) {
      throw new BadRequestException(`Mã "${code}" đã hết lượt sử dụng`)
    }

    // 4. Check user usage
    const userUsage = await tx.discountUsage.count({ where: { discountId: discount.id, userId } })
    if (discount.maxUsesPerUser > 0 && userUsage >= discount.maxUsesPerUser) {
      throw new BadRequestException(`Bạn đã dùng hết lượt mã "${code}"`)
    }

    // 5. Check min order value
    if (orderValue < discount.minOrderValue) {
      throw new BadRequestException(`Đơn hàng tối thiểu phải từ ${discount.minOrderValue} để dùng mã "${code}"`)
    }

    const maxCap = discount.maxDiscountValue ?? 0
    let discountAmount = 0
    let shippingDiscount = 0

    // 6. SHIPPING type
    if (discount.type === 'SHIPPING') {
      if (shippingFee <= 0) {
        throw new BadRequestException('Đơn hàng không có phí vận chuyển để áp dụng mã freeship')
      }
      if (discount.value >= 100) {
        shippingDiscount = shippingFee
      } else {
        shippingDiscount = (shippingFee * discount.value) / 100
      }
      if (maxCap > 0) shippingDiscount = Math.min(shippingDiscount, maxCap)
      shippingDiscount = Math.round(Math.min(shippingDiscount, shippingFee))
    } else {
      // 7. PERCENTAGE / FIXED_AMOUNT / COIN_CASHBACK
      let applicableAmount = 0
      if (discount.applyTo === 'ALL') {
        applicableAmount = orderValue
      } else {
        const validProductIds = discount.products.map((p) => p.productId)
        const validCategoryIds = discount.categories.map((c) => c.categoryId)
        for (const item of items) {
          const isProductValid = validProductIds.includes(item.productId)
          const isCategoryValid = item.categoryIds.some((cid) => validCategoryIds.includes(cid))
          if (isProductValid || isCategoryValid) {
            applicableAmount += item.price * item.quantity
          }
        }
      }
      if (applicableAmount === 0) {
        throw new BadRequestException(`Mã "${code}" không áp dụng cho sản phẩm nào trong đơn hàng`)
      }
      if (discount.type === 'FIXED_AMOUNT' || discount.type === 'COIN_CASHBACK') {
        discountAmount = discount.value
      } else if (discount.type === 'PERCENTAGE') {
        discountAmount = (applicableAmount * discount.value) / 100
        if (maxCap > 0) discountAmount = Math.min(discountAmount, maxCap)
      }
      discountAmount = Math.round(Math.min(discountAmount, orderValue))
    }

    const finalDiscountAmount = discountAmount + shippingDiscount

    // 8. Create DiscountUsage record
    await tx.discountUsage.create({
      data: {
        discountId: discount.id,
        userId,
        orderId,
        discountAmount: finalDiscountAmount,
      },
    })

    // 9. Increment useCount
    await tx.discount.update({
      where: { id: discount.id },
      data: { useCount: { increment: 1 } },
    })

    // 10. Mark UserSavedDiscount as used (if user saved this voucher)
    await tx.userSavedDiscount
      .update({
        where: { userId_discountId: { userId, discountId: discount.id } },
        data: { isUsed: true },
      })
      .catch(() => {
        // User didn't save this voucher beforehand — that's fine
      })

    return { discountAmount, shippingDiscount }
  }

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
  async create(
    userId: number,
    body: ResolvedCreateOrderItem[],
  ): Promise<{
    paymentId: number
    orders: CreateOrderBodyResType['orders']
  }> {
    const [paymentId, orders] = await this.prismaService.$transaction<[number, CreateOrderBodyResType['orders']]>(
      async (tx) => {
        //1. kiểm tra xem all cartItems có tồn tại in db
        const allBodyCartItemIds = body.map((item) => item.cartItemIds).flat()
        //Pessimistic lock
        // const cartItemsForSKUIds = await tx.cartItem.findMany({
        //   where: {
        //     id: {
        //       in: allBodyCartItemIds,
        //     },
        //     userId,
        //   },
        //   select: {
        //     skuId: true,
        //   },
        // })
        // //tiến hành khóa pessimistic lock
        // const skuIds = cartItemsForSKUIds.map((item) => item.skuId)
        // await tx.$queryRaw`SELECT * FROM skus WHERE id IN (${Prisma.join(skuIds)}) FOR UPDATE`
        //----------------
        const cartItems = await tx.cartItem.findMany({
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
                    categories: true,
                  },
                },
              },
            },
          },
        })
        // Kiểm tra xem cartItems có tồn tại trong db không
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
        const payment = await tx.payment.create({
          data: {
            status: PAYMENT_STATUS.PENDING,
          },
        })

        const orders: CreateOrderBodyResType['orders'] = []

        for (const item of body) {
          // Build items info for discount validation
          const orderCartItems = item.cartItemIds.map((cartItemId) => cartItemMap.get(cartItemId)!)
          const discountItems = orderCartItems.map((ci) => ({
            productId: ci.sku.productId,
            categoryIds: ci.sku.product.categories.map((c) => c.id),
            price: ci.sku.price,
            quantity: ci.quantity,
          }))

          const order = await tx.order.create({
            data: {
              userId,
              status: ORDER_STATUS.UNPAID,
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
          })

          // Apply discounts after order is created (need orderId for DiscountUsage)
          let totalDiscountAmount = 0

          if (item.shopDiscountCode) {
            const result = await this.validateAndApplyDiscount(tx, {
              code: item.shopDiscountCode,
              userId,
              orderId: order.id,
              items: discountItems,
              shippingFee: 0,
            })
            totalDiscountAmount += result.discountAmount + result.shippingDiscount
          }

          if (item.platformDiscountCode) {
            const result = await this.validateAndApplyDiscount(tx, {
              code: item.platformDiscountCode,
              userId,
              orderId: order.id,
              items: discountItems,
              shippingFee: 0,
            })
            totalDiscountAmount += result.discountAmount + result.shippingDiscount
          }

          // Update discountAmount on order if any discount was applied
          if (totalDiscountAmount > 0) {
            await tx.order.update({
              where: { id: order.id },
              data: { discountAmount: totalDiscountAmount },
            })
          }

          orders.push({ ...order, discountAmount: totalDiscountAmount })
        }

        await tx.cartItem.deleteMany({
          where: {
            id: {
              in: allBodyCartItemIds,
            },
          },
        })

        for (const item of cartItems) {
          await tx.sKU
            .update({
              where: {
                id: item.sku.id,
                updatedAt: item.sku.updatedAt,
                stock: {
                  gte: item.quantity,
                },
              },
              data: {
                stock: {
                  decrement: item.quantity,
                },
              },
            })
            .catch((e) => {
              if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
                throw VerionConflictException
              }
              throw e
            })
        }

        await this.orderProducer.addCancelPaymentJob(payment.id)
        return [payment.id, orders]
      },
    )
    return {
      paymentId,
      orders,
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
  async updateStatus(orderId: number, userId: number, body: UpdateOrderStatusType) {
    const order = await this.prismaService.order.findUnique({
      where: {
        id: orderId,
        userId,
        deletedAt: null,
      },
    })
    if (!order) {
      throw OrdetNotFoundException
    }

    const allowedTransitions: Record<UpdateOrderStatusType['status'], UpdateOrderStatusType['status'][]> = {
      [ORDER_STATUS.UNPAID]: [ORDER_STATUS.READY_TO_SHIP, ORDER_STATUS.CANCELLED],
      [ORDER_STATUS.READY_TO_SHIP]: [ORDER_STATUS.SHIPPED],
      [ORDER_STATUS.SHIPPED]: [ORDER_STATUS.COMPLETED, ORDER_STATUS.TO_RETURN],
      [ORDER_STATUS.COMPLETED]: [ORDER_STATUS.TO_RETURN],
      [ORDER_STATUS.TO_RETURN]: [],
      [ORDER_STATUS.CANCELLED]: [],
    }

    const nextStatuses = allowedTransitions[order.status as UpdateOrderStatusType['status']] ?? []
    if (!nextStatuses.includes(body.status)) {
      throw InvalidOrderStatusTransitionException
    }

    return this.prismaService.order.update({
      where: {
        id: orderId,
      },
      data: {
        status: body.status,
        updatedById: userId,
      },
    })
  }
  async cancel(userId: number, orderId: number): Promise<CancelOrderResType> {
    try {
      const order = await this.prismaService.order.findUniqueOrThrow({
        where: {
          id: orderId,
          userId,
          deletedAt: null,
        },
        include: {
          discountUsages: true,
        },
      })
      if (order.status !== ORDER_STATUS.UNPAID) {
        throw CanNotCancelOrderException
      }

      const updateOrder = await this.prismaService.$transaction(async (tx) => {
        // 1. Hủy đơn
        const updated = await tx.order.update({
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

        // 2. Hoàn voucher: giảm useCount, reset UserSavedDiscount, xóa DiscountUsage
        if (order.discountUsages.length > 0) {
          for (const usage of order.discountUsages) {
            // Giảm useCount của discount (không để âm)
            await tx.discount.update({
              where: { id: usage.discountId },
              data: {
                useCount: { decrement: 1 },
              },
            })

            // Reset trạng thái "đã dùng" trong UserSavedDiscount (nếu có)
            await tx.userSavedDiscount
              .update({
                where: {
                  userId_discountId: {
                    userId: usage.userId,
                    discountId: usage.discountId,
                  },
                },
                data: { isUsed: false },
              })
              .catch(() => {
                // Nếu user không lưu voucher trước đó thì bỏ qua
              })
          }

          // Xóa tất cả DiscountUsage của đơn này
          await tx.discountUsage.deleteMany({
            where: { orderId },
          })
        }

        return updated
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
