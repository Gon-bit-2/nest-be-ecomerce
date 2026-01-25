import { Injectable } from '@nestjs/common'
import { DiscountRepo } from './repository/discount.repo'
import { GetDiscountListType } from './model/discount.model'

@Injectable()
export class DiscountService {
  constructor(private readonly discountRepo: DiscountRepo) {}

  async list(pagination: GetDiscountListType) {
    return this.discountRepo.list(pagination)
  }

  async listAvailable(pagination: GetDiscountListType) {
    return this.discountRepo.listAvailable(pagination)
  }

  async listMyVouchers(userId: number, pagination: GetDiscountListType) {
    return this.discountRepo.listMyVouchers(userId, pagination)
  }
  async detail(discountId: number) {
    return this.discountRepo.detail(discountId)
  }
}
