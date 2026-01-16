import { Module } from '@nestjs/common'
import { OrderService } from './order.service'
import { OrderController } from './order.controller'
import { OrderRepo } from './repository/order.repo'
import { BullModule } from '@nestjs/bullmq'

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'order',
    }),
  ],
  controllers: [OrderController],
  providers: [OrderService, OrderRepo],
})
export class OrderModule {}
