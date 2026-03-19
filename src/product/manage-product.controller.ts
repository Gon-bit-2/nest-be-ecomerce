import { Controller, Get, Post, Body, Param, Delete, Query, Put } from '@nestjs/common'
import {
  CreateProductBodyDTO,
  GetManageProductQueryDTO,
  GetProductDetailResDTO,
  GetProductParamsDTO,
  GetProductResDTO,
  ProductDTO,
  UpdateProductBodyDTO,
} from './dto/product.dto'
import { ZodSerializerDto } from 'nestjs-zod'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { MessageResDTO } from 'src/shared/dtos/response.dto'
import { ManageProductService } from './manage-product.service'
import { type AccessTokenPayload } from 'src/shared/types/jwt.type'

@Controller('manage-product/products')
export class ManageProductController {
  constructor(private readonly manageProductService: ManageProductService) {}

  @Get()
  @ZodSerializerDto(GetProductResDTO)
  async list(@Query() query: GetManageProductQueryDTO, @ActiveUser() user: AccessTokenPayload) {
    const products = await this.manageProductService.list({
      query,
      roleNameRequest: user.roleName,
      userIdRequest: user.userId,
    })
    return products
  }

  @Get(':productId')
  @ZodSerializerDto(GetProductDetailResDTO)
  async getDetail(@Param() params: GetProductParamsDTO, @ActiveUser() user: AccessTokenPayload) {
    const product = await this.manageProductService.getDetail({
      productId: params.productId,
      roleNameRequest: user.roleName,
      userIdRequest: user.userId,
    })
    return product
  }

  @Post()
  @ZodSerializerDto(GetProductDetailResDTO)
  async create(@Body() body: CreateProductBodyDTO, @ActiveUser('userId') userId: number) {
    const product = await this.manageProductService.create({ data: body, createdById: userId })
    return product
  }

  @Put(':productId')
  @ZodSerializerDto(ProductDTO)
  async update(
    @Param() params: GetProductParamsDTO,
    @Body() body: UpdateProductBodyDTO,
    @ActiveUser() user: AccessTokenPayload,
  ) {
    const product = await this.manageProductService.update({
      productId: params.productId,
      data: body,
      updatedById: user.userId,
      roleNameRequest: user.roleName,
    })
    return product
  }

  @Delete(':productId')
  @ZodSerializerDto(MessageResDTO)
  async delete(@Param() params: GetProductParamsDTO, @ActiveUser() user: AccessTokenPayload) {
    const product = await this.manageProductService.delete({
      productId: params.productId,
      deletedById: user.userId,
      roleNameRequest: user.roleName,
    })
    return product
  }
}
