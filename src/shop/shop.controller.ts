import { Controller, Post, Get, Body } from '@nestjs/common'
import { ShopService } from './shop.service'
import { RegisterShopDTO, GetMyShopResDTO, GetShopStatisticsResDTO } from './dto/shop.dto'
import { ZodSerializerDto } from 'nestjs-zod'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { MessageResDTO } from 'src/shared/dtos/response.dto'

@Controller('shop')
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @Post('register')
  @ZodSerializerDto(MessageResDTO)
  register(@Body() body: RegisterShopDTO, @ActiveUser('userId') userId: number) {
    return this.shopService.register(userId, body)
  }

  @Get('my-shop')
  @ZodSerializerDto(GetMyShopResDTO)
  getMyShop(@ActiveUser('userId') userId: number) {
    return this.shopService.getMyShop(userId)
  }

  @Get('statistics')
  @ZodSerializerDto(GetShopStatisticsResDTO)
  getStatistics(@ActiveUser('userId') userId: number) {
    return this.shopService.getStatistics(userId)
  }
}
