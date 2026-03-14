import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { DiscountService } from './discount.service'
import {
  CreateDiscountBodyDTO,
  CreateDiscountResBodyDTO,
  GetDiscountListDTO,
  GetDiscountListResDTO,
  GetDiscountParamsDTO,
  PreviewDiscountBodyDTO,
  PreviewDiscountResBodyDTO,
  UpdateDiscountBodyDTO,
  UpdateDiscountResBodyDTO,
} from './dto/discount.dto'
import { ZodSerializerDto } from 'nestjs-zod'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { IsAdmin, IsSeller } from 'src/shared/decorators/roles.decorator'
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

  @Post()
  @IsSeller()
  @ZodSerializerDto(CreateDiscountResBodyDTO)
  async create(@Body() body: CreateDiscountBodyDTO, @ActiveUser('userId') userId: number) {
    return this.discountService.create({ body, createdById: userId })
  }

  @Put(':discountId')
  @IsSeller()
  @ZodSerializerDto(UpdateDiscountResBodyDTO)
  async update(
    @Param() param: GetDiscountParamsDTO,
    @Body() body: UpdateDiscountBodyDTO,
    @ActiveUser('userId') userId: number,
  ) {
    return this.discountService.update({ discountId: param.discountId, body, updatedById: userId, createdById: userId })
  }

  @Delete(':discountId')
  @IsSeller()
  async delete(@Param() param: GetDiscountParamsDTO, @ActiveUser('userId') userId: number) {
    return this.discountService.delete({ discountId: param.discountId, deletedById: userId })
  }

  @Post(':discountId/save')
  async save(@Param() param: GetDiscountParamsDTO, @ActiveUser('userId') userId: number) {
    return await this.discountService.save({ discountId: param.discountId, userId })
  }

  @Post('preview')
  @ZodSerializerDto(PreviewDiscountResBodyDTO)
  async preview(@Body() body: PreviewDiscountBodyDTO) {
    return this.discountService.preview(body)
  }
}
