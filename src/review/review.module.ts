import { Module } from '@nestjs/common'
import { ReviewService } from './review.service'
import { ReviewController } from './review.controller'
import { ReviewRepo } from './repository/review.repo'

@Module({
  controllers: [ReviewController],
  providers: [ReviewService, ReviewRepo],
})
export class ReviewModule {}
