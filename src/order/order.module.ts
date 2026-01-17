import { Module } from '@nestjs/common'
import { OrderService } from './order.service'
import { OrderController } from './order.controller'
import { OrderRepo } from './repository/order.repo'
import { BullModule } from '@nestjs/bullmq'
import { PAYMENT_QUEUE_NAME } from 'src/shared/constants/queue.constant'
import { OrderProducer } from './queue/order.producer'

@Module({
  imports: [
    BullModule.registerQueue({
      name: PAYMENT_QUEUE_NAME,
    }),
  ],
  controllers: [OrderController],
  providers: [OrderService, OrderRepo, OrderProducer],
  exports: [OrderProducer],
})
export class OrderModule {}
