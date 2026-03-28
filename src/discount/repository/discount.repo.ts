import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import {
  CreateDiscountBodyResType,
  CreateDiscountBodyType,
  GetDiscountListResType,
  GetDiscountListType,
  PreviewDiscountResType,
  PreviewDiscountType,
  UpdateDiscountBodyType,
  UpdateDiscountResBodyType,
} from '../model/discount.model'
import {
  assertDiscountEligibility,
  assertDiscountScopeForPreview,
  evaluateDiscountPolicy,
  getOrderValue,
} from '../policy/discount-policy.engine'
import { PrismaService } from 'src/shared/service/prisma.service'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'

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

  async create({
    body,
    createdById,
  }: {
    body: CreateDiscountBodyType
    createdById: number
  }): Promise<CreateDiscountBodyResType> {
    try {
      const { productIds, categoryIds, startDate, endDate, ...data } = body
      const discount = await this.prismaService.discount.create({
        data: {
          ...data,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          products: {
            create: productIds?.map((id) => ({
              product: { connect: { id } },
            })),
          },
          categories: {
            create: categoryIds?.map((id) => ({
              category: { connect: { id } },
            })),
          },
          createdById,
        },
        include: {
          products: true,
          categories: true,
        },
      })
      return {
        ...discount,
        productIds: discount.products.map((product) => product.productId),
        categoryIds: discount.categories.map((category) => category.categoryId),
      }
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new BadRequestException(' Danh mục, Sản phẩm hoặc Cửa hàng không hợp lệ!')
        }
      }
      throw error
    }
  }
  async update({
    discountId,
    body,
    updatedById,
    createdById,
  }: {
    discountId: number
    body: UpdateDiscountBodyType
    createdById: number
    updatedById: number
  }): Promise<UpdateDiscountResBodyType> {
    const { productIds: newProductIds, categoryIds: newCategoryIds, ...data } = body

    const result = await this.prismaService.$transaction(async (tx) => {
      //Check discount tồn tại
      const discount = await tx.discount.findUnique({ where: { id: discountId }, select: { shopId: true } })
      if (!discount) {
        throw new NotFoundException('Mã giảm giá không tồn tại')
      }
      // A. XỬ LÝ PRODUCTS
      if (newProductIds) {
        // A1. Lấy danh sách ID hiện tại trong DB
        const currentProducts = await tx.discountsOnProducts.findMany({
          where: { discountId },
          select: { productId: true },
        })
        const currentProductIds = currentProducts.map((p) => p.productId)

        // A2. Tính toán diff
        const toCreate = newProductIds.filter((id) => !currentProductIds.includes(id)) // Có trong mới, không có trong cũ -> Thêm
        const toDelete = currentProductIds.filter((id) => !newProductIds.includes(id)) // Có trong cũ, không có trong mới -> Xóa

        // A3. Thực thi
        if (toDelete.length > 0) {
          await tx.discountsOnProducts.deleteMany({
            where: { discountId, productId: { in: toDelete } },
          })
        }
        if (toCreate.length > 0) {
          await tx.discountsOnProducts.createMany({
            data: toCreate.map((productId) => ({ discountId, productId })),
          })
        }
      }

      // B. XỬ LÝ CATEGORIES
      if (newCategoryIds) {
        const currentCategories = await tx.discountsOnCategories.findMany({
          where: { discountId },
          select: { categoryId: true },
        })
        const currentCategoryIds = currentCategories.map((c) => c.categoryId)

        const catToCreate = newCategoryIds.filter((id) => !currentCategoryIds.includes(id))
        const catToDelete = currentCategoryIds.filter((id) => !newCategoryIds.includes(id))

        if (catToDelete.length > 0) {
          await tx.discountsOnCategories.deleteMany({
            where: { discountId, categoryId: { in: catToDelete } },
          })
        }
        if (catToCreate.length > 0) {
          await tx.discountsOnCategories.createMany({
            data: catToCreate.map((categoryId) => ({ discountId, categoryId })),
          })
        }
      }

      // C. UPDATE THÔNG TIN CƠ BẢN
      return tx.discount.update({
        where: { id: discountId, shopId: createdById },
        data: {
          ...data,
          ...(data.startDate && { startDate: new Date(data.startDate) }),
          ...(data.endDate && { endDate: new Date(data.endDate) }),
          updatedById,
        },
        include: {
          products: true,
          categories: true,
        },
      })
    })

    // 3. Map kết quả trả về
    return {
      ...result,
      productIds: result.products.map((p) => p.productId),
      categoryIds: result.categories.map((c) => c.categoryId),
    }
  }

  async save({ discountId, userId }: { discountId: number; userId: number }) {
    // 1. Kiểm tra mã có hợp lệ để lưu không?
    const discount = await this.prismaService.discount.findUnique({
      where: { id: discountId, deletedAt: null, isActive: true, endDate: { gte: new Date() } },
    })

    if (!discount) {
      throw new NotFoundException('Mã giảm giá không tồn tại hoặc đã bị khóa')
    }
    // 2. Thử tạo bản ghi (Dùng thủ thuật connectOrCreate hoặc check exist)
    // Cách đơn giản nhất để tránh lỗi Duplicate Key là check trước
    const existing = await this.prismaService.userSavedDiscount.findUnique({
      where: { userId_discountId: { userId, discountId } },
    })

    if (existing) {
      return existing // Đã lưu rồi thì trả về luôn, coi như thành công (Idempotency)
    }
    // 3. Lưu mới
    return this.prismaService.userSavedDiscount.create({
      data: {
        discountId,
        userId,
      },
    })
  }

  async delete(
    {
      discountId,
      deletedById,
    }: {
      discountId: number
      deletedById: number
    },
    isHard?: boolean,
  ) {
    return isHard
      ? this.prismaService.discount.delete({
          where: {
            id: discountId,
          },
        })
      : this.prismaService.discount.update({
          where: {
            id: discountId,
            deletedAt: null,
          },
          data: {
            deletedById,
            deletedAt: new Date(),
          },
        })
  }

  // --- Helper for Preview/Apply ---
  async findByCode(code: string) {
    return this.prismaService.discount.findUnique({
      where: {
        code,
        deletedAt: null,
        isActive: true,
      },
      include: {
        products: true, // Lấy list sản phẩm áp dụng
        categories: true, // Lấy list danh mục áp dụng
      },
    })
  }

  async countUsageByUser(discountId: number, userId: number) {
    return this.prismaService.discountUsage.count({
      where: {
        discountId,
        userId,
      },
    })
  }
  async preview(body: PreviewDiscountType): Promise<PreviewDiscountResType> {
    const { code, userId, shopId, items, shippingFee = 0 } = body
    const policyItems = items.map((item) => ({
      productId: item.productId,
      categoryIds: item.categoryId ? [item.categoryId] : [],
      price: item.price,
      quantity: item.quantity,
    }))

    // Tính tổng tiền từ items thay vì tin tưởng orderValue từ FE
    const orderValue = getOrderValue(policyItems)

    // 1. Lấy thông tin mã
    const discount = await this.findByCode(code)
    if (!discount) throw new BadRequestException('Mã không tồn tại hoặc không khả dụng')

    assertDiscountScopeForPreview({
      discount,
      shopId,
    })

    // Check usage eligibility
    const userUsage = await this.countUsageByUser(discount.id, userId)

    assertDiscountEligibility({
      discount,
      orderValue,
      userUsage,
    })

    const evaluation = evaluateDiscountPolicy({
      discount,
      items: policyItems,
      shippingFee,
    })

    return {
      isValid: true,
      discountAmount: evaluation.discountAmount,
      shippingDiscount: evaluation.shippingDiscount,
      finalPrice: orderValue - evaluation.discountAmount,
      finalShippingFee: shippingFee - evaluation.shippingDiscount,
      message: discount.type === 'SHIPPING' ? 'Áp dụng mã freeship thành công' : 'Áp dụng mã thành công',
      discountType: discount.type,
      discountRawValue: discount.value,
      maxDiscountValue: discount.maxDiscountValue,
      applicableAmount: evaluation.applicableAmount,
    }
  }
}
