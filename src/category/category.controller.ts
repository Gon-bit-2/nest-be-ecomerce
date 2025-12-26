import { Controller, Get, Post, Body, Param, Delete, Query, Put } from '@nestjs/common'
import { CategoryService } from './category.service'
import { isPublic } from 'src/shared/decorators/auth.decorator'
import {
  CreateCategoryDTO,
  GetAllCategoriesQueryDTO,
  GetCategoryDetailResDTO,
  GetCategoryParamsDTO,
  UpdateCategoryDTO,
} from './dto/category.dto'
import { ZodSerializerDto } from 'nestjs-zod'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { MessageResDTO } from 'src/shared/dtos/response.dto'

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @isPublic()
  @ZodSerializerDto(GetCategoryDetailResDTO)
  findAll(@Query() query: GetAllCategoriesQueryDTO) {
    return this.categoryService.findAll({ parentCategoryId: query.parentCategoryId })
  }

  @Get(':id')
  @isPublic()
  @ZodSerializerDto(GetCategoryDetailResDTO)
  findById(@Param() params: GetCategoryParamsDTO) {
    return this.categoryService.findById({ id: params.categoryId })
  }

  @Post()
  @ZodSerializerDto(GetCategoryDetailResDTO)
  create(@Body() body: CreateCategoryDTO, @ActiveUser('userId') userId: number) {
    return this.categoryService.create({ createdById: userId, data: body })
  }

  @Put(':id')
  @ZodSerializerDto(GetCategoryDetailResDTO)
  update(
    @Param() params: GetCategoryParamsDTO,
    @Body() updateCategoryDto: UpdateCategoryDTO,
    @ActiveUser('userId') userId: number,
  ) {
    return this.categoryService.update({ id: params.categoryId, data: updateCategoryDto, updatedById: userId })
  }

  @Delete(':id')
  @ZodSerializerDto(MessageResDTO)
  remove(@Param() params: GetCategoryParamsDTO, @ActiveUser('userId') userId: number) {
    return this.categoryService.delete({ id: params.categoryId, deletedById: userId })
  }
}
