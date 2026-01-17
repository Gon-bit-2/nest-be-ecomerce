import { Module } from '@nestjs/common'
import { PaymentService } from './payment.service'
import { PaymentController } from './payment.controller'
import { PaymentRepo } from './repository/payment.repo'
import { BullModule } from '@nestjs/bullmq'
import { PAYMENT_QUEUE_NAME } from 'src/shared/constants/queue.constant'
import { PaymentProducer } from './queue/payment.producer'

@Module({
  imports: [
    BullModule.registerQueue({
      name: PAYMENT_QUEUE_NAME,
      defaultJobOptions: {
        removeOnComplete: 100, // Xóa các job đã hoàn thành, chỉ giữ lại 100 job gần nhất
        removeOnFail: 1000, // Giữ lại 1000 job lỗi để debug
        attempts: 3, // Thử lại 3 lần nếu lỗi
      },
    }),
  ],
  controllers: [PaymentController],
  providers: [PaymentService, PaymentRepo, PaymentProducer],
})
export class PaymentModule {}
