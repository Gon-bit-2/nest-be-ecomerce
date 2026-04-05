import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common'
import { ProductTranslationService } from './product-translation.service'
import {
  CreateProductTranslationBodyDTO,
  DeleteProductTranslationParamsDTO,
  GetProductTranslationDetailResDTO,
  GetProductTranslationParamsDTO,
  UpdateProductTranslationBodyDTO,
} from './dto/product-translation.dto'
import { ZodSerializerDto } from 'nestjs-zod'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'

@Controller('product-translation')
export class ProductTranslationController {
  constructor(private readonly productTranslationService: ProductTranslationService) {}

  @Get(':productTranslationId')
  @ZodSerializerDto(GetProductTranslationDetailResDTO)
  async findById(@Param() params: GetProductTranslationParamsDTO) {
    return this.productTranslationService.findById(params.productTranslationId)
  }

  @Post()
  @ZodSerializerDto(GetProductTranslationDetailResDTO)
  async create(@Body() body: CreateProductTranslationBodyDTO, @ActiveUser('userId') userId: number) {
    return this.productTranslationService.create({ data: body, createdById: userId })
  }

  @Patch(':productTranslationId')
  @ZodSerializerDto(GetProductTranslationDetailResDTO)
  async update(
    @Param() params: GetProductTranslationParamsDTO,
    @Body() body: UpdateProductTranslationBodyDTO,
    @ActiveUser('userId') userId: number,
  ) {
    return this.productTranslationService.update({ data: body, updatedById: userId, id: params.productTranslationId })
  }

  @Delete(':productTranslationId')
  @ZodSerializerDto(DeleteProductTranslationParamsDTO)
  async delete(@Param() params: GetProductTranslationParamsDTO, @ActiveUser('userId') userId: number) {
    return this.productTranslationService.delete({ deletedById: userId, id: params.productTranslationId })
  }
}
