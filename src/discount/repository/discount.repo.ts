import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { GetDiscountListResType, GetDiscountListType } from '../model/discount.model'
import { PrismaService } from 'src/shared/service/prisma.service'

@Injectable()
export class DiscountRepo {
  constructor(private readonly prismaService: PrismaService) {}

  async list(pagination: GetDiscountListType): Promise<GetDiscountListResType> {
    const skip = (pagination.page - 1) * pagination.limit
    const take = pagination.limit
    const where: Prisma.DiscountWhereInput = {
      deletedAt: null,
    }

    if (pagination.shopId) {
      where.shopId = pagination.shopId
    }

    if (pagination.type) {
      where.type = pagination.type
    }

    if (pagination.scope) {
      where.scope = pagination.scope
    }

    if (pagination.isActive !== undefined) {
      where.isActive = pagination.isActive
    }

    if (pagination.search) {
      where.OR = [
        { name: { contains: pagination.search, mode: 'insensitive' } },
        { code: { contains: pagination.search, mode: 'insensitive' } },
      ]
    }

    const [totalItems, data] = await Promise.all([
      this.prismaService.discount.count({ where }),
      this.prismaService.discount.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
    ])

    return {
      data,
      totalItems,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(totalItems / pagination.limit),
    }
  }

  async listAvailable(pagination: GetDiscountListType): Promise<GetDiscountListResType> {
    const skip = (pagination.page - 1) * pagination.limit
    const take = pagination.limit
    const now = new Date()

    const where: Prisma.DiscountWhereInput = {
      deletedAt: null,
      isActive: true, // Bắt buộc Active
      startDate: { lte: now }, // Đã bắt đầu
      endDate: { gte: now }, // Chưa kết thúc
    }

    if (pagination.shopId) {
      where.shopId = pagination.shopId
    }

    if (pagination.type) {
      where.type = pagination.type
    }

    if (pagination.scope) {
      where.scope = pagination.scope
    }

    if (pagination.search) {
      where.OR = [
        { name: { contains: pagination.search, mode: 'insensitive' } },
        { code: { contains: pagination.search, mode: 'insensitive' } },
      ]
    }

    const [totalItems, data] = await Promise.all([
      this.prismaService.discount.count({ where }),
      this.prismaService.discount.findMany({
        where,
        skip,
        take,
        orderBy: { endDate: 'asc' }, // Ưu tiên mã sắp hết hạn lên đầu để user dùng nhanh
      }),
    ])

    return {
      data,
      totalItems,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(totalItems / pagination.limit),
    }
  }

  async listMyVouchers(userId: number, pagination: GetDiscountListType): Promise<GetDiscountListResType> {
    const skip = (pagination.page - 1) * pagination.limit
    const take = pagination.limit
    const now = new Date()

    const discountWhere: Prisma.DiscountWhereInput = {
      deletedAt: null,
      isActive: true,
      startDate: { lte: now },
      endDate: { gte: now },
    }

    // Apply filters to the relation
    if (pagination.shopId) {
      discountWhere.shopId = pagination.shopId
    }
    if (pagination.type) {
      discountWhere.type = pagination.type
    }
    if (pagination.scope) {
      discountWhere.scope = pagination.scope
    }
    if (pagination.search) {
      discountWhere.OR = [
        { name: { contains: pagination.search, mode: 'insensitive' } },
        { code: { contains: pagination.search, mode: 'insensitive' } },
      ]
    }

    const where: Prisma.UserSavedDiscountWhereInput = {
      userId,
      isUsed: false, // Chỉ lấy mã chưa dùng
      discount: discountWhere,
    }

    const [totalItems, savedDiscounts] = await Promise.all([
      this.prismaService.userSavedDiscount.count({ where }),
      this.prismaService.userSavedDiscount.findMany({
        where,
        skip,
        take,
        include: {
          discount: true, // Lấy chi tiết discount
        },
        orderBy: { savedAt: 'desc' },
      }),
    ])

    // Map data về dạng Discount thông thường
    const data = savedDiscounts.map((item) => item.discount)

    return {
      data,
      totalItems,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(totalItems / pagination.limit),
    }
  }
  async detail(discountId: number) {
    return this.prismaService.discount.findUnique({ where: { id: discountId } })
  }
}
