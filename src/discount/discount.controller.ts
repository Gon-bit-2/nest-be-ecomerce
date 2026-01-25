import { Controller, Get, Param, Query } from '@nestjs/common'
import { DiscountService } from './discount.service'
import { GetDiscountListDTO, GetDiscountListResDTO, GetDiscountParamsDTO } from './dto/discount.dto'
import { ZodSerializerDto } from 'nestjs-zod'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { IsAdmin } from 'src/shared/decorators/roles.decorator'
@Controller('discount')
export class DiscountController {
  constructor(private readonly discountService: DiscountService) {}

  @Get()
  @IsAdmin()
  @ZodSerializerDto(GetDiscountListResDTO)
  async list(@Query() pagination: GetDiscountListDTO) {
    return this.discountService.list(pagination)
  }

  @Get('available')
  @ZodSerializerDto(GetDiscountListResDTO)
  async listAvailable(@Query() pagination: GetDiscountListDTO) {
    return this.discountService.listAvailable(pagination)
  }

  @Get('my-vouchers')
  @ZodSerializerDto(GetDiscountListResDTO)
  async listMyVouchers(@ActiveUser('userId') userId: number, @Query() pagination: GetDiscountListDTO) {
    return this.discountService.listMyVouchers(userId, pagination)
  }

  @Get(':discountId')
  @ZodSerializerDto(GetDiscountListResDTO)
  async detail(@Param() param: GetDiscountParamsDTO) {
    return this.discountService.detail(param.discountId)
  }
}
