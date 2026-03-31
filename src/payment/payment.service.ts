import { Injectable } from '@nestjs/common'
import { PaymentRepo } from './repository/payment.repo'
import { WebhookPaymentBodyType } from './model/payment.model'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { SharedWebsocketRepository } from 'src/shared/repositories/shared-websocket.repo'
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Server } from 'socket.io'
import { generateRoomUserId } from 'src/shared/helpers'
import envConfig from 'src/shared/config'
import { PAYMENT_CODE_PREFIX } from 'src/shared/constants/other.constant'

@Injectable()
@WebSocketGateway({ namespace: 'payment' })
export class PaymentService {
  @WebSocketServer()
  server: Server
  constructor(
    private readonly paymentRepo: PaymentRepo,
    private readonly sharedWebsocket: SharedWebsocketRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async receiver(body: WebhookPaymentBodyType) {
    const userId = await this.paymentRepo.receiver(body)

    // Broadcast websocket payment status
    this.server.to(generateRoomUserId(userId)).emit('payment', {
      status: 'success',
    })

    // Emit event notifications -> Push Notification + Sending Email
    this.eventEmitter.emit('payment.success', {
      userId,
      orderCode: body.referenceCode,
      amount: body.transferAmount,
    })

    // try {
    //   const websockets = await this.sharedWebsocket.findMany(userId)
    //   websockets.forEach((websocket) => {
    //     this.server.to(websocket.id).emit('payment', {
    //       status: 'success',
    //     })
    //   })
    // } catch (error) {
    //   console.log(error)
    // }
    return {
      message: 'Payment Success',
    }
  }

  getConfig() {
    return {
      accountNumber: envConfig.PAYMENT_ACCOUNT_NUMBER,
      bankCode: envConfig.PAYMENT_BANK_CODE,
      prefix: PAYMENT_CODE_PREFIX,
    }
  }

  getPaymentStatus(paymentId: number, userId: number) {
    return this.paymentRepo.getPaymentStatus(paymentId, userId)
  }
}
