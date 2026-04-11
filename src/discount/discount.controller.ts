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
import { IsAdmin, IsSeller, Roles } from 'src/shared/decorators/roles.decorator'
import roleName from 'src/shared/constants/role.constant'

@Controller('discount')
export class DiscountController {
  constructor(private readonly discountService: DiscountService) {}

  @Get()
  @Roles(roleName.Admin, roleName.Seller)
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
  @Roles(roleName.Admin, roleName.Seller)
  @ZodSerializerDto(CreateDiscountResBodyDTO)
  async create(
    @Body() body: CreateDiscountBodyDTO,
    @ActiveUser('userId') userId: number,
    @ActiveUser('roleName') userRole: string,
  ) {
    return this.discountService.create({ body, createdById: userId, userRole })
  }

  @Put(':discountId')
  @Roles(roleName.Admin, roleName.Seller)
  @ZodSerializerDto(UpdateDiscountResBodyDTO)
  async update(
    @Param() param: GetDiscountParamsDTO,
    @Body() body: UpdateDiscountBodyDTO,
    @ActiveUser('userId') userId: number,
    @ActiveUser('roleName') userRole: string,
  ) {
    return this.discountService.update({
      discountId: param.discountId,
      body,
      updatedById: userId,
      createdById: userId,
      userRole,
    })
  }

  @Delete(':discountId')
  @Roles(roleName.Admin, roleName.Seller)
  async delete(
    @Param() param: GetDiscountParamsDTO,
    @ActiveUser('userId') userId: number,
    @ActiveUser('roleName') userRole: string,
  ) {
    return this.discountService.delete({ discountId: param.discountId, deletedById: userId, userRole })
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
