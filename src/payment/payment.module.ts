import { Module } from '@nestjs/common'
import { PaymentService } from './payment.service'
import { PaymentController } from './payment.controller'
import { PaymentRepo } from './repository/payment.repo'

@Module({
  controllers: [PaymentController],
  providers: [PaymentService, PaymentRepo],
})
export class PaymentModule {}
