import { Module } from '@nestjs/common'
import { DiscountService } from './discount.service'
import { DiscountController } from './discount.controller'
import { DiscountRepo } from './repository/discount.repo'

@Module({
  controllers: [DiscountController],
  providers: [DiscountService, DiscountRepo],
  exports: [DiscountRepo], // Export để OrderModule có thể sử dụng
})
export class DiscountModule {}
