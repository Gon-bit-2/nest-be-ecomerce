import { Controller, Get, Post, Body, Param, Delete, Query, Put } from '@nestjs/common'
import { BrandService } from './brand.service'

import { type PaginationQueryType } from 'src/shared/model/request.model'
import { isPublic } from 'src/shared/decorators/auth.decorator'
import { ZodSerializerDto } from 'nestjs-zod'
import { CreateBrandBodyDTO, GetBrandDetailResDTO, GetBrandParamsDTO, GetBrandResDTO } from 'src/brand/dto/brand.dto'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'

@Controller('brand')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Get()
  @isPublic()
  @ZodSerializerDto(GetBrandResDTO)
  list(@Query() query: PaginationQueryType) {
    return this.brandService.list(query)
  }
  @Get(':id')
  @isPublic()
  @ZodSerializerDto(GetBrandDetailResDTO)
  findById(@Param() params: GetBrandParamsDTO) {
    return this.brandService.findById(params.brandId)
  }
  @Post()
  @ZodSerializerDto(GetBrandDetailResDTO)
  create(@Body() body: CreateBrandBodyDTO, @ActiveUser('userId') userId: number) {
    return this.brandService.create({ data: body, createdById: userId })
  }

  @Put(':id')
  @ZodSerializerDto(GetBrandDetailResDTO)
  update(@Body() body: CreateBrandBodyDTO, @Param() params: GetBrandParamsDTO, @ActiveUser('userId') userId: number) {
    return this.brandService.update({
      id: params.brandId,
      data: body,
      updatedById: userId,
    })
  }

  @Delete(':id')
  remove(@Param() params: GetBrandParamsDTO, @ActiveUser('userId') userId: number) {
    return this.brandService.delete({ id: params.brandId, deletedById: userId })
  }
}
