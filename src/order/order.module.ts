import { Module } from '@nestjs/common'
import { OrderService } from './order.service'
import { OrderController } from './order.controller'
import { OrderRepo } from './repository/order.repo'

@Module({
  controllers: [OrderController],
  providers: [OrderService, OrderRepo],
})
export class OrderModule {}
