import { Controller, Get, Param, Query } from '@nestjs/common'
import { ProductService } from './product.service'
import { GetProductDetailResDTO, GetProductParamsDTO, GetProductQueryDTO, GetProductResDTO } from './dto/product.dto'
import { ZodSerializerDto } from 'nestjs-zod'
import { isPublic } from 'src/shared/decorators/auth.decorator'

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

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
}
