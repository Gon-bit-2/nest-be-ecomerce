import { Module } from '@nestjs/common'
import { ShopVideoController } from './shop-video.controller'
import { ShopVideoService } from './shop-video.service'
import { ShopVideoRepo } from './repository/shop-video.repo'

@Module({
  controllers: [ShopVideoController],
  providers: [ShopVideoService, ShopVideoRepo],
  exports: [ShopVideoService],
})
export class ShopVideoModule {}
