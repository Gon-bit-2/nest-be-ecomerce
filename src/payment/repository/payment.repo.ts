import { BadRequestException, Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/service/prisma.service'
import { WebhookPaymentBodyType } from '../model/payment.model'
import { parse } from 'date-fns'
import { PAYMENT_CODE_PREFIX } from 'src/shared/constants/other.constant'
import { OrderIncludeProductSKUSnapshotType } from 'src/shared/model/shared-order.model'
import { ORDER_STATUS } from 'src/shared/constants/order.constant'
import { PAYMENT_STATUS } from 'src/shared/constants/payment.constant'
import { PaymentProducer } from '../queue/payment.producer'

@Injectable()
export class PaymentRepo {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly paymentProducer: PaymentProducer,
  ) {}

  private getTotalPrice(orders: OrderIncludeProductSKUSnapshotType[]): number {
    return orders.reduce((total, order) => {
      const orderTotal = order.items.reduce((totalPrice, productSku) => {
        return totalPrice + productSku.quantity * productSku.skuPrice
      }, 0)
      return total + orderTotal
    }, 0)
  }
  async receiver(body: WebhookPaymentBodyType): Promise<number> {
    //1. thêm thông tin giao dịch vào db
    let amountIn = 0
    let amountOut = 0
    if (body.transferType === 'in') {
      amountIn = body.transferAmount
    } else if (body.transferType === 'out') {
      amountOut = body.transferAmount
    }
    const paymentTransaction = await this.prismaService.paymentTransaction.findUnique({
      where: {
        id: body.id,
      },
    })
    if (paymentTransaction) {
      throw new BadRequestException('Payment Transaction already exists')
    }
    const userId = await this.prismaService.$transaction(async (tx) => {
      await tx.paymentTransaction.create({
        data: {
          id: body.id,
          gateway: body.gateway,
          transactionDate: parse(body.transactionDate, 'yyyy-MM-dd HH:mm:ss', new Date()),
          accountNumber: body.accountNumber,
          subAccount: body.subAccount,
          amountIn: amountIn,
          amountOut: amountOut,
          accumulated: body.accumulated,
          code: body.code,
          transactionContent: body.content,
          referenceNumber: body.referenceCode,
          body: body.description,
        },
      })
      //2. Kiểm tra nội dung chuyển tiền và tổng tiền có khớp
      const paymentId = body.code
        ? Number(body.code.split(PAYMENT_CODE_PREFIX)[1])
        : Number(body.content?.split(PAYMENT_CODE_PREFIX)[1])
      if (isNaN(paymentId)) {
        throw new BadRequestException('Cannot get payment id from code or content')
      }
      const payment = await tx.payment.findUnique({
        where: {
          id: paymentId,
        },
        include: {
          order: {
            include: {
              items: true,
            },
          },
        },
      })
      if (!payment) {
        throw new BadRequestException(`Payment not found with id ${paymentId}`)
      }
      const userId = payment.order[0].userId
      const { order } = payment
      const totalPrice = this.getTotalPrice(order)
      if (totalPrice !== body.transferAmount) {
        throw new BadRequestException('Total price not match')
      }
      //3. Cập nhập trạng thái đơn hàng

      await Promise.all([
        tx.payment.update({
          where: {
            id: payment.id,
          },
          data: {
            status: PAYMENT_STATUS.SUCCESS,
          },
        }),
        tx.order.updateMany({
          where: {
            id: {
              in: order.map((od) => od.id),
            },
          },
          data: {
            status: ORDER_STATUS.PENDING_PICKUP,
          },
        }),
        this.paymentProducer.removeJob(payment.id),
      ])
      return userId
    })
    return userId
  }
}
