import { Injectable } from '@nestjs/common'
import { ReviewRepo } from './repository/review.repo'
import { PaginationQueryType } from 'src/shared/model/request.model'
import { CreateReviewBodyType, UpdateReviewBodyType } from './model/review.model'

@Injectable()
export class ReviewService {
  constructor(private readonly reviewRepo: ReviewRepo) {}
  async list(productId: number, pagination: PaginationQueryType) {
    return await this.reviewRepo.list(productId, pagination)
  }

  async create(userId: number, body: CreateReviewBodyType) {
    return await this.reviewRepo.create(userId, body)
  }

  async update({ userId, reviewId, body }: { userId: number; reviewId: number; body: UpdateReviewBodyType }) {
    return await this.reviewRepo.update({ userId, reviewId, body })
  }
}
