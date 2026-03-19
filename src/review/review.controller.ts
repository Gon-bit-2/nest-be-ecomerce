import { Body, Controller, Get, Param, Post, Put, Query, ParseIntPipe } from '@nestjs/common'
import { ReviewService } from './review.service'
import { PaginationQueryDTO } from 'src/shared/dtos/request.dto'
import {
  CreateReviewBodyDTO,
  CreateReviewResDTO,
  GetReviewDetailParamsDTO,
  GetReviewsDTO,
  UpdateReviewResDTO,
} from './dto/review.dto'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { ZodSerializerDto } from 'nestjs-zod'
import { isPublic } from 'src/shared/decorators/auth.decorator'

@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}
  @isPublic()
  @Get('/product/:productId')
  @ZodSerializerDto(GetReviewsDTO)
  async list(@Param('productId', ParseIntPipe) productId: number, @Query() pagination: PaginationQueryDTO) {
    return await this.reviewService.list(productId, pagination)
  }

  @Post()
  @ZodSerializerDto(CreateReviewResDTO)
  async create(@ActiveUser('userId') userId: number, @Body() body: CreateReviewBodyDTO) {
    return await this.reviewService.create(userId, body)
  }

  @Put(':reviewId')
  @ZodSerializerDto(UpdateReviewResDTO)
  async update(
    @ActiveUser('userId') userId: number,
    @Param() param: GetReviewDetailParamsDTO,
    @Body() body: CreateReviewBodyDTO,
  ) {
    return await this.reviewService.update({ userId, reviewId: param.reviewId, body })
  }
}
