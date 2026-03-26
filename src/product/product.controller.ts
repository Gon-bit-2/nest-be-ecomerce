import { Controller, Get, Param, Query } from '@nestjs/common'
import { ProductService } from './product.service'
import {
  GetProductDetailResDTO,
  GetProductParamsDTO,
  GetProductQueryDTO,
  GetProductResDTO,
  SearchProductQueryDTO,
} from './dto/product.dto'
import { ZodSerializerDto } from 'nestjs-zod'
import { isPublic } from 'src/shared/decorators/auth.decorator'

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get('search')
  @isPublic()
  @ZodSerializerDto(GetProductResDTO)
  async search(@Query() query: SearchProductQueryDTO) {
    const products = await this.productService.search({ query })
    return products
  }

  @Get()
  @isPublic()
  @ZodSerializerDto(GetProductResDTO)
  async list(@Query() query: GetProductQueryDTO) {
    const products = await this.productService.list({ query })
    return products
  }

  @Get(':productId')
  @isPublic()
  @ZodSerializerDto(GetProductDetailResDTO)
  async getDetail(@Param() params: GetProductParamsDTO) {
    const product = await this.productService.getDetail({ productId: params.productId })
    return product
  }

  @Get(':productId/variants')
  @isPublic()
  async getVariants(@Param() params: GetProductParamsDTO) {
    const variants = await this.productService.getVariants({ productId: params.productId })
    return variants
  }
}
