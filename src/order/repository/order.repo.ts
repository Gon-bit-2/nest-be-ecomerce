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
import {
  assertDiscountEligibility,
  assertDiscountScopeForApply,
  evaluateDiscountPolicy,
  getOrderValue,
} from 'src/discount/policy/discount-policy.engine'

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
      shopId: number
      expectedScope: 'SHOP' | 'PLATFORM'
      items: { productId: number; categoryIds: number[]; price: number; quantity: number }[]
      shippingFee: number
    },
  ): Promise<{ discountAmount: number; shippingDiscount: number }> {
    const { code, userId, orderId, shopId, expectedScope, items, shippingFee } = params
    const orderValue = getOrderValue(items)

    // 1. Find discount by code
    const discount = await tx.discount.findUnique({
      where: { code, deletedAt: null, isActive: true },
      include: { products: true, categories: true },
    })
    if (!discount) throw new BadRequestException(`Mã "${code}" không tồn tại hoặc không khả dụng`)

    assertDiscountScopeForApply({
      discount,
      expectedScope,
      shopId,
      code,
    })

    // Check usage eligibility
    const userUsage = await tx.discountUsage.count({ where: { discountId: discount.id, userId } })
    assertDiscountEligibility({
      discount,
      orderValue,
      userUsage,
      code,
    })

    const evaluation = evaluateDiscountPolicy({
      discount,
      items,
      shippingFee,
      code,
    })

    const discountAmount = evaluation.discountAmount
    const shippingDiscount = evaluation.shippingDiscount

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

    // 9. Increment useCount with a compare-and-swap style guard to avoid oversubscribe on concurrency.
    const updateUseCountResult = await tx.discount.updateMany({
      where: {
        id: discount.id,
        ...(discount.maxTotalUses > 0 ? { useCount: { lt: discount.maxTotalUses } } : {}),
      },
      data: { useCount: { increment: 1 } },
    })

    if (updateUseCountResult.count === 0) {
      throw new BadRequestException(`Mã "${code}" đã hết lượt sử dụng`)
    }

    // 10. Mark UserSavedDiscount as used ONLY if user reached max usage (if they saved this voucher)
    if (discount.maxUsesPerUser > 0 && userUsage + 1 >= discount.maxUsesPerUser) {
      await tx.userSavedDiscount
        .update({
          where: { userId_discountId: { userId, discountId: discount.id } },
          data: { isUsed: true },
        })
        .catch(() => {
          // User didn't save this voucher beforehand — that's fine
        })
    }

    return { discountAmount, shippingDiscount }
  }

  async list(userId: number, query: GetOrderListQueryType, roleName: string) {
    const { limit, page, status } = query
    const skip = (page - 1) * limit
    const take = limit

    const where: Prisma.OrderWhereInput = { status }

    // Phân quyền dữ liệu theo role:
    if (roleName === 'SELLER') {
      where.shopId = userId
    } else if (roleName !== 'ADMIN') {
      // Default (BUYER): Chỉ lấy đơn hàng của chính user đó mua
      where.userId = userId
    }
    // Với Admin (roleName === 'ADMIN'): Không giới hạn userId hay shopId (được xem tất cả)

    const data$ = this.prismaService.order.findMany({
      where,
      include: {
        items: true,
        reviews: {
          select: { productId: true },
        },
      },
      take,
      skip,
      orderBy: {
        createdAt: 'desc',
      },
    })
    const totalItem$ = this.prismaService.order.count({
      where,
    })
    const [data, totalItems] = await Promise.all([data$, totalItem$])

    const mappedData = data.map((order) => {
      const items = order.items.map((item) => ({
        ...item,
        isReviewed: order.reviews.some((review) => review.productId === item.productId),
      }))
      const { reviews, ...rest } = order
      return { ...rest, items }
    })

    return {
      data: mappedData,
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
              shippingFee: item.shippingFee ?? 0,
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
          let remainingShippingFee = item.shippingFee ?? 0

          if (item.shopDiscountCode) {
            const result = await this.validateAndApplyDiscount(tx, {
              code: item.shopDiscountCode,
              userId,
              orderId: order.id,
              shopId: item.shopId,
              expectedScope: 'SHOP',
              items: discountItems,
              shippingFee: remainingShippingFee,
            })
            totalDiscountAmount += result.discountAmount + result.shippingDiscount
            remainingShippingFee = Math.max(0, remainingShippingFee - result.shippingDiscount)
          }

          if (item.platformDiscountCode) {
            const result = await this.validateAndApplyDiscount(tx, {
              code: item.platformDiscountCode,
              userId,
              orderId: order.id,
              shopId: item.shopId,
              expectedScope: 'PLATFORM',
              items: discountItems,
              shippingFee: remainingShippingFee,
            })
            totalDiscountAmount += result.discountAmount + result.shippingDiscount
            remainingShippingFee = Math.max(0, remainingShippingFee - result.shippingDiscount)
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
  async detail(userId: number, orderId: number, roleName: string): Promise<GetOrderDetailResType> {
    const whereCondition: Prisma.OrderWhereInput = {
      id: orderId,
      deletedAt: null,
    }

    if (roleName !== 'ADMIN') {
      whereCondition.OR = [{ createdById: userId }, { shopId: userId }, { userId: userId }]
    }

    const order = await this.prismaService.order.findFirst({
      where: whereCondition,
      include: {
        items: true,
        reviews: {
          select: { productId: true },
        },
      },
    })

    if (!order) {
      throw OrdetNotFoundException
    }

    const items = order.items.map((item) => ({
      ...item,
      isReviewed: order.reviews.some((review) => review.productId === item.productId),
    }))
    const { reviews, ...rest } = order

    return { ...rest, items }
  }

  async updateStatus(orderId: number, userId: number, body: UpdateOrderStatusType, roleName: string) {
    const whereCondition: Prisma.OrderWhereInput = {
      id: orderId,
      deletedAt: null,
    }

    if (roleName !== 'ADMIN') {
      whereCondition.OR = [{ createdById: userId }, { shopId: userId }, { userId: userId }]
    }

    const order = await this.prismaService.order.findFirst({
      where: whereCondition,
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
  async cancel(userId: number, orderId: number, roleName: string): Promise<CancelOrderResType> {
    try {
      const whereCondition: Prisma.OrderWhereInput = {
        id: orderId,
        deletedAt: null,
      }

      if (roleName !== 'ADMIN') {
        whereCondition.OR = [{ createdById: userId }, { shopId: userId }, { userId: userId }]
      }

      const order = await this.prismaService.order.findFirstOrThrow({
        where: whereCondition,
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
