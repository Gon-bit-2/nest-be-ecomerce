import { Module } from '@nestjs/common'
import { ShopController } from './shop.controller'
import { ShopService } from './shop.service'
import { ShopRepo } from './repository/shop.repo'

@Module({
  controllers: [ShopController],
  providers: [ShopService, ShopRepo],
})
export class ShopModule {}
