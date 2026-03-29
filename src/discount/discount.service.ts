import { ForbiddenException, Injectable } from '@nestjs/common'
import { DiscountRepo } from './repository/discount.repo'
import {
  CreateDiscountBodyType,
  GetDiscountListType,
  PreviewDiscountType,
  UpdateDiscountBodyType,
} from './model/discount.model'
import roleName from 'src/shared/constants/role.constant'

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
  async create({
    body,
    createdById,
    userRole,
  }: {
    body: CreateDiscountBodyType
    createdById: number
    userRole: string
  }) {
    if (body.scope === 'PLATFORM') {
      if (userRole !== roleName.Admin) {
        throw new ForbiddenException('Chỉ có Admin mới có quyền tạo mã giảm giá toàn sàn!')
      }
      body.shopId = null
    } else {
      if (userRole === roleName.Seller) {
        body.shopId = createdById
      }
    }
    return this.discountRepo.create({ body, createdById })
  }
  async update({
    discountId,
    body,
    createdById,
    updatedById,
    userRole,
  }: {
    discountId: number
    body: UpdateDiscountBodyType
    createdById: number
    updatedById: number
    userRole: string
  }) {
    const existingDiscount = await this.discountRepo.detail(discountId)
    if (!existingDiscount) {
      throw new ForbiddenException('Mã giảm giá không tồn tại!')
    }

    if (existingDiscount.scope === 'PLATFORM') {
      if (userRole !== roleName.Admin) {
        throw new ForbiddenException('Chỉ có Admin mới có quyền cập nhật mã giảm giá toàn sàn!')
      }
    } else if (existingDiscount.scope === 'SHOP') {
      if (userRole === roleName.Seller && existingDiscount.shopId !== createdById) {
        throw new ForbiddenException('Bạn không có quyền cập nhật mã giảm giá của shop khác!')
      }
    }

    if (body.scope === 'PLATFORM') {
      if (userRole !== roleName.Admin) {
        throw new ForbiddenException('Chỉ có Admin mới có quyền tạo mã giảm giá toàn sàn!')
      }
      body.shopId = null
    } else if (body.scope === 'SHOP') {
      if (userRole === roleName.Seller) {
        body.shopId = createdById
      }
    }
    return this.discountRepo.update({ discountId, body, updatedById, createdById })
  }
  async delete({ discountId, deletedById, userRole }: { discountId: number; deletedById: number; userRole: string }) {
    const existingDiscount = await this.discountRepo.detail(discountId)
    if (!existingDiscount) {
      throw new ForbiddenException('Mã giảm giá không tồn tại!')
    }

    if (existingDiscount.scope === 'PLATFORM') {
      if (userRole !== roleName.Admin) {
        throw new ForbiddenException('Chỉ có Admin mới có quyền xóa mã giảm giá toàn sàn!')
      }
    } else if (existingDiscount.scope === 'SHOP') {
      if (userRole === roleName.Seller && existingDiscount.shopId !== deletedById) {
        throw new ForbiddenException('Bạn không có quyền xóa mã giảm giá của shop khác!')
      }
    }

    return this.discountRepo.delete({ discountId, deletedById })
  }
  async preview(body: PreviewDiscountType) {
    return this.discountRepo.preview(body)
  }
  async save({ discountId, userId }: { discountId: number; userId: number }) {
    return this.discountRepo.save({ discountId, userId })
  }
}
