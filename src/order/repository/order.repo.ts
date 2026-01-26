import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from 'src/shared/service/prisma.service'
import {
  CancelOrderResType,
  CreateOrderBodyResType,
  CreateOrderBodyType,
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
import { DiscountRepo } from 'src/discount/repository/discount.repo'

@Injectable()
export class OrderRepo {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly orderProducer: OrderProducer,
    private readonly discountRepo: DiscountRepo,
  ) {}

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
    body: CreateOrderBodyType,
  ): Promise<{
    paymentId: number
    orders: CreateOrderBodyResType['orders']
  }> {
    const { orders: bodyOrders, platformDiscountCode } = body

    // 1. Kiểm tra xem all cartItems có tồn tại in db
    const allBodyCartItemIds = bodyOrders.map((item) => item.cartItemIds).flat()
    const cartItems = await this.prismaService.cartItem.findMany({
      where: {
        id: { in: allBodyCartItemIds },
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

    if (cartItems.length !== allBodyCartItemIds.length) {
      throw NotFoundCartItemException
    }

    // 2. Validate Stock & Rules
    const isOutOfStock = cartItems.some((item) => item.sku.stock < item.quantity)
    if (isOutOfStock) throw OutOfStockSKUException

    const isExitsNotReadyProduct = cartItems.some((item) => {
      const prod = item.sku.product
      return prod.deletedAt !== null || prod.publishedAt === null || prod.publishedAt > new Date()
    })
    if (isExitsNotReadyProduct) throw NotFoundCartItemException

    // 3. Validate Shop Ownership
    const cartItemMap = new Map<number, (typeof cartItems)[0]>()
    cartItems.forEach((item) => cartItemMap.set(item.id, item))

    const isValidShop = bodyOrders.every((item) => {
      return item.cartItemIds.every((cartItemId) => {
        const cartItem = cartItemMap.get(cartItemId)!
        return item.shopId === cartItem.sku.createdById
      })
    })
    if (!isValidShop) throw SKUNotBeLongToShopException

    // --- LOGIC DISCOUNT ---

    // Data structures để lưu kết quả tính toán
    const shopOrderCalculations: Array<{
      orderIndex: number
      shopId: number
      originalTotal: number
      shopDiscountAmount: number
      shopDiscountId?: number
      subTotalAfterShopDiscount: number // Dùng để tính Platform Discount
      platformDiscountAmount: number // Số tiền được giảm từ Voucher sàn (phân bổ)
      platformDiscountId?: number
      items: any[]
    }> = []

    let totalSubTotalForPlatform = 0

    // 4. Phase 1: Tính toán Shop Discount cho từng order
    for (let i = 0; i < bodyOrders.length; i++) {
      const orderBody = bodyOrders[i]
      const orderCartItems = orderBody.cartItemIds.map((id) => cartItemMap.get(id)!)

      const items = orderCartItems.map((item) => ({
        productId: item.sku.productId,
        categoryId: item.sku.product.categories[0]?.id,
        price: item.sku.price,
        quantity: item.quantity,
      }))

      const originalTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      let shopDiscountAmount = 0
      let shopDiscountId: number | undefined

      // Apply Shop Discount
      if (orderBody.shopDiscountCode) {
        const preview = await this.discountRepo.preview({
          code: orderBody.shopDiscountCode,
          userId,
          orderValue: originalTotal,
          items,
          shopId: orderBody.shopId, // Validate shop scope
        })
        shopDiscountAmount = preview.discountAmount
        const discount = await this.discountRepo.findByCode(orderBody.shopDiscountCode)
        shopDiscountId = discount?.id
      }

      const subTotal = Math.max(0, originalTotal - shopDiscountAmount)

      shopOrderCalculations.push({
        orderIndex: i,
        shopId: orderBody.shopId,
        originalTotal,
        shopDiscountAmount,
        shopDiscountId,
        subTotalAfterShopDiscount: subTotal,
        platformDiscountAmount: 0, // Tính sau
        items,
      })

      totalSubTotalForPlatform += subTotal
    }

    // 5. Phase 2: Apply Platform Discount (Voucher Sàn)
    let platformDiscountId: number | undefined
    if (platformDiscountCode && totalSubTotalForPlatform > 0) {
      // Gom tất cả items của tất cả shop để check platform voucher
      const allItems = shopOrderCalculations.flatMap((c) => c.items)

      const previewPlatform = await this.discountRepo.preview({
        code: platformDiscountCode,
        userId,
        orderValue: totalSubTotalForPlatform, // Giá trị đơn hàng sau khi trừ Shop Voucher
        items: allItems,
      })

      const totalPlatformDiscount = previewPlatform.discountAmount
      const discount = await this.discountRepo.findByCode(platformDiscountCode)
      platformDiscountId = discount?.id

      if (totalPlatformDiscount > 0) {
        // Allocation: Phân bổ giảm giá sàn vào từng order
        let distributed = 0

        for (let i = 0; i < shopOrderCalculations.length; i++) {
          const calc = shopOrderCalculations[i]

          if (i === shopOrderCalculations.length - 1) {
            // Cái cuối cùng nhận phần dư để tránh lỗi làm tròn
            calc.platformDiscountAmount = Math.max(0, totalPlatformDiscount - distributed)
          } else {
            const ratio = calc.subTotalAfterShopDiscount / totalSubTotalForPlatform
            const amount = Math.floor(totalPlatformDiscount * ratio) // Làm tròn xuống
            calc.platformDiscountAmount = amount
            distributed += amount
          }
          calc.platformDiscountId = platformDiscountId
        }
      }
    }

    // 6. Transaction: Save Order & Update DB
    const [paymentId, orders] = await this.prismaService.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: { status: PAYMENT_STATUS.PENDING },
      })

      const createdOrders = await Promise.all(
        bodyOrders.map(async (item, index) => {
          const calc = shopOrderCalculations[index]

          // Tạo Order
          const order = await tx.order.create({
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
                    productTranslations: cartItem.sku.product.productTranslations.map((t) => ({
                      id: t.id,
                      name: t.name,
                      description: t.description,
                      languageId: t.languageId,
                    })),
                  }
                }),
              },
              product: {
                connect: item.cartItemIds.map((cartItemId) => ({
                  id: cartItemMap.get(cartItemId)!.sku.productId,
                })),
              },
            },
          })

          // Lưu Discount Usage - Shop Voucher
          if (calc.shopDiscountId && calc.shopDiscountAmount > 0) {
            await tx.discountUsage.create({
              data: {
                discountId: calc.shopDiscountId,
                userId,
                orderId: order.id,
                discountAmount: calc.shopDiscountAmount,
              },
            })
            // Increment usage
            await tx.discount.update({
              where: { id: calc.shopDiscountId },
              data: { useCount: { increment: 1 } },
            })
            // Mark as used
            await tx.userSavedDiscount.updateMany({
              where: { userId, discountId: calc.shopDiscountId },
              data: { isUsed: true },
            })
          }

          // Lưu Discount Usage - Platform Voucher
          if (calc.platformDiscountId && calc.platformDiscountAmount > 0) {
            await tx.discountUsage.create({
              data: {
                discountId: calc.platformDiscountId,
                userId,
                orderId: order.id,
                discountAmount: calc.platformDiscountAmount,
              },
            })
            // Platform useCount tăng 1 lần cho cả giao dịch hay 1 lần cho mỗi order con?
            // Logic Shopee: Mã code đc dùng 1 lần cho cả cụm.
            // Nếu ta increment trong loop này thì sẽ tăng N lần (N = số shop order).
            // => Move logic increment ra ngoài loop hoặc check flag.
          }

          return order
        }),
      )

      // Update Platform Voucher Usage (Once per transaction)
      if (platformDiscountId) {
        await tx.discount.update({
          where: { id: platformDiscountId },
          data: { useCount: { increment: 1 } },
        })
        await tx.userSavedDiscount.updateMany({
          where: { userId, discountId: platformDiscountId },
          data: { isUsed: true },
        })
      }

      // Cleanup Cart & Stock
      await tx.cartItem.deleteMany({
        where: { id: { in: allBodyCartItemIds } },
      })

      const skuUpdates = cartItems.map((item) =>
        tx.sKU.update({
          where: { id: item.sku.id },
          data: { stock: { decrement: item.quantity } },
        }),
      )
      await Promise.all(skuUpdates)

      await this.orderProducer.addCancelPaymentJob(payment.id) // Fire & Forget (or await if need safe)

      return [payment.id, createdOrders]
    })

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

    if (body.status === ORDER_STATUS.DELIVERED) {
      if (order.status !== ORDER_STATUS.PENDING_DELIVERY) {
        throw InvalidOrderStatusTransitionException
      }
    } else if (body.status === ORDER_STATUS.RETURNED) {
      if (order.status !== ORDER_STATUS.DELIVERED) {
        throw InvalidOrderStatusTransitionException
      }
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
