import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common'
import { CategoryTransalitonService } from './category-transaliton.service'

import { ZodSerializerDto } from 'nestjs-zod'
import {
  CreateCategoryTranslationBodyDTO,
  GetCategoryTranslationDetailResDTO,
  GetCategoryTranslationParamsDTO,
} from './dto/category-translation.dto'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { MessageResDTO } from 'src/shared/dtos/response.dto'

@Controller('category-transaliton')
export class CategoryTransalitonController {
  constructor(private readonly categoryTransalitonService: CategoryTransalitonService) {}

  @Get(':categoryTranslationId')
  @ZodSerializerDto(GetCategoryTranslationDetailResDTO)
  findById(@Param() params: GetCategoryTranslationParamsDTO) {
    return this.categoryTransalitonService.findById({ id: params.categoryTranslationId })
  }

  @Post()
  @ZodSerializerDto(GetCategoryTranslationDetailResDTO)
  create(@Body() body: CreateCategoryTranslationBodyDTO, @ActiveUser('userId') userId: number) {
    return this.categoryTransalitonService.create({ createdById: userId, data: body })
  }

  @Put(':categoryTranslationId')
  @ZodSerializerDto(GetCategoryTranslationDetailResDTO)
  update(
    @Body() body: CreateCategoryTranslationBodyDTO,
    @ActiveUser('userId') userId: number,
    @Param() params: GetCategoryTranslationParamsDTO,
  ) {
    return this.categoryTransalitonService.update({ id: params.categoryTranslationId, data: body, updatedById: userId })
  }

  @Delete(':categoryTranslationId')
  @ZodSerializerDto(MessageResDTO)
  remove(@Param() params: GetCategoryTranslationParamsDTO, @ActiveUser('userId') userId: number) {
    return this.categoryTransalitonService.delete({ id: params.categoryTranslationId, deletedById: userId })
  }
}
