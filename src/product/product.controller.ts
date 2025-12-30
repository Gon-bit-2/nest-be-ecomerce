import { Controller, Get, Post, Body, Param, Delete, Query, Put } from '@nestjs/common'
import { ProductService } from './product.service'
import {
  CreateProductBodyDTO,
  GetProductDetailResDTO,
  GetProductParamsDTO,
  GetProductQueryDTO,
  GetProductResDTO,
  ProductDTO,
  UpdateProductBodyDTO,
} from './dto/product.dto'
import { ZodSerializerDto } from 'nestjs-zod'
import { isPublic } from 'src/shared/decorators/auth.decorator'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { MessageResDTO } from 'src/shared/dtos/response.dto'

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @isPublic()
  @ZodSerializerDto(GetProductResDTO)
  async list(@Query() query: GetProductQueryDTO) {
    const products = await this.productService.list(query)
    return products
  }

  @Get(':productId')
  @isPublic()
  @ZodSerializerDto(GetProductDetailResDTO)
  async findById(@Param() params: GetProductParamsDTO) {
    const product = await this.productService.finById(params.productId)
    return product
  }

  @Post()
  @ZodSerializerDto(GetProductDetailResDTO)
  async create(@Body() body: CreateProductBodyDTO, @ActiveUser('userId') userId: number) {
    const product = await this.productService.create({ data: body, createdById: userId })
    return product
  }

  @Put(':productId')
  @ZodSerializerDto(ProductDTO)
  async update(
    @Param() params: GetProductParamsDTO,
    @Body() body: UpdateProductBodyDTO,
    @ActiveUser('userId') userId: number,
  ) {
    const product = await this.productService.update({ id: params.productId, data: body, updatedById: userId })
    return product
  }

  @Delete(':productId')
  @ZodSerializerDto(MessageResDTO)
  async delete(@Param() params: GetProductParamsDTO, @ActiveUser('userId') userId: number) {
    const product = await this.productService.delete({ id: params.productId, deletedById: userId })
    return product
  }
}
