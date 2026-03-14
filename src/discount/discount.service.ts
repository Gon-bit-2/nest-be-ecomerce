import { Injectable } from '@nestjs/common'
import { DiscountRepo } from './repository/discount.repo'
import {
  CreateDiscountBodyType,
  GetDiscountListType,
  PreviewDiscountType,
  UpdateDiscountBodyType,
} from './model/discount.model'

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
  async create({ body, createdById }: { body: CreateDiscountBodyType; createdById: number }) {
    return this.discountRepo.create({ body, createdById })
  }
  async update({
    discountId,
    body,
    createdById,
    updatedById,
  }: {
    discountId: number
    body: UpdateDiscountBodyType
    createdById: number
    updatedById: number
  }) {
    return this.discountRepo.update({ discountId, body, updatedById, createdById })
  }
  async delete({ discountId, deletedById }: { discountId: number; deletedById: number }) {
    return this.discountRepo.delete({ discountId, deletedById })
  }
  async preview(body: PreviewDiscountType) {
    return this.discountRepo.preview(body)
  }
  async save({ discountId, userId }: { discountId: number; userId: number }) {
    return this.discountRepo.save({ discountId, userId })
  }
}
