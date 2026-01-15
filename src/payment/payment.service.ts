import { Injectable } from '@nestjs/common'
import { PaymentRepo } from './repository/payment.repo'
import { WebhookPaymentBodyType } from './model/payment.model'

@Injectable()
export class PaymentService {
  constructor(private readonly paymentRepo: PaymentRepo) {}

  async receiver(body: WebhookPaymentBodyType) {
    return this.paymentRepo.receiver(body)
  }
}
