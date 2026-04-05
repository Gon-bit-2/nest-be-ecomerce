import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  CreateBrandTranslationBodyDTO,
  GetBrandTranslationDetailResSchema,
  GetBrandTranslationParamsDTO,
  UpdateBrandTranslationBodyDTO,
} from 'src/brand/brand-translation/brand-translation.dto'
import { BrandTranslationService } from 'src/brand/brand-translation/brand-translation.service'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { MessageResDTO } from 'src/shared/dtos/response.dto'

@Controller('brand-translation')
export class BrandTranslationController {
  constructor(private readonly brandTranslationService: BrandTranslationService) {}
  @Get(':brandTranslationId')
  @ZodSerializerDto(GetBrandTranslationDetailResSchema)
  findById(@Param() params: GetBrandTranslationParamsDTO) {
    return this.brandTranslationService.findById(params.brandTranslationId)
  }
  @Post()
  @ZodSerializerDto(GetBrandTranslationDetailResSchema)
  create(@Body() body: CreateBrandTranslationBodyDTO, @ActiveUser('userId') userId: number) {
    return this.brandTranslationService.create({ data: body, createdById: userId })
  }
  @Put(':brandTranslationId')
  @ZodSerializerDto(GetBrandTranslationDetailResSchema)
  update(
    @Body() body: UpdateBrandTranslationBodyDTO,
    @Param() params: GetBrandTranslationParamsDTO,
    @ActiveUser('userId') userId: number,
  ) {
    return this.brandTranslationService.update({ id: params.brandTranslationId, data: body, updatedById: userId })
  }
  @Delete(':brandTranslationId')
  @ZodSerializerDto(MessageResDTO)
  delete(@Param() params: GetBrandTranslationParamsDTO, @ActiveUser('userId') userId: number) {
    return this.brandTranslationService.delete({
      id: params.brandTranslationId,
      deletedById: userId,
    })
  }
}
