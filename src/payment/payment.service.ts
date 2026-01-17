import { Injectable } from '@nestjs/common'
import { PaymentRepo } from './repository/payment.repo'
import { WebhookPaymentBodyType } from './model/payment.model'
import { PaymentProducer } from './queue/payment.producer'

@Injectable()
export class PaymentService {
  constructor(
    private readonly paymentRepo: PaymentRepo,
    private readonly paymentProducer: PaymentProducer,
  ) {}

  async receiver(body: WebhookPaymentBodyType) {
    const result = await this.paymentRepo.receiver(body)
    await this.paymentProducer.removeJob(result.paymentId)
    return {
      message: result.message,
    }
  }
}
