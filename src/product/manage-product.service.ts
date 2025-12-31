import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { ProductRepo } from './repository/product.repo'
import { CreateProductBodyType, GetManageProductQueryType, UpdateProductBodyType } from './product.model'
import { I18nContext } from 'nestjs-i18n'
import { NotFoundRecordException } from 'src/shared/error/error'
import roleName from 'src/shared/constants/role.constant'

@Injectable()
export class ManageProductService {
  constructor(private readonly productRepo: ProductRepo) {}

  /**
   * Kiểm tra người dùng nếu không phải creater or Admin thì không cho tiếp tục
   *
   */
  validatePrivilege({
    userIdRequest,
    roleNameRequest,
    createdById,
  }: {
    userIdRequest: number
    roleNameRequest: string
    createdById: number | undefined | null
  }) {
    if (createdById !== userIdRequest && roleNameRequest !== roleName.Admin) {
      throw new ForbiddenException()
    }
    return true
  }

  /**
   * @description: Xem danh sách sản phẩm của một shop, bắt buộc truyền createdById
   * @param query
   * @returns
   */
  async list(props: { query: GetManageProductQueryType; userIdRequest: number; roleNameRequest: string }) {
    this.validatePrivilege({
      userIdRequest: props.userIdRequest,
      roleNameRequest: props.roleNameRequest,
      createdById: props.query.createdById,
    })
    const data = await this.productRepo.list({
      page: props.query.page,
      limit: props.query.limit,
      languageId: I18nContext.current()?.lang as string,
      createdById: props.query.createdById,
      isPublic: props.query.isPublic,
      brandIds: props.query.brandIds,
      categories: props.query.categories,
      minPrice: props.query.minPrice,
      maxPrice: props.query.maxPrice,
      name: props.query.name,
    })
    return data
  }
  async getDetail(props: { productId: number; userIdRequest: number; roleNameRequest: string }) {
    const product = await this.productRepo.getDetail({
      productId: props.productId,
      languageId: I18nContext.current()?.lang as string,
    })
    if (!product) {
      throw NotFoundRecordException
    }
    this.validatePrivilege({
      userIdRequest: props.userIdRequest,
      roleNameRequest: props.roleNameRequest,
      createdById: product.createdById,
    })
    return product
  }
  async create({ data, createdById }: { data: CreateProductBodyType; createdById: number }) {
    const product = await this.productRepo.create({ data, createdById })
    return product
  }
  async update({
    productId,
    data,
    updatedById,
    roleNameRequest,
  }: {
    productId: number
    data: UpdateProductBodyType
    updatedById: number
    roleNameRequest: string
  }) {
    const product = await this.productRepo.findById(productId)
    if (!product) {
      throw NotFoundRecordException
    }
    this.validatePrivilege({
      userIdRequest: updatedById,
      roleNameRequest: roleNameRequest,
      createdById: product.createdById,
    })
    try {
      const updatedProduct = await this.productRepo.update({ id: productId, data, updatedById })
      return updatedProduct
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw NotFoundRecordException
      }
      throw error
    }
  }
  async delete({
    productId,
    deletedById,
    roleNameRequest,
  }: {
    productId: number
    deletedById: number
    roleNameRequest: string
  }) {
    const product = await this.productRepo.findById(productId)
    if (!product) {
      throw NotFoundRecordException
    }
    this.validatePrivilege({
      userIdRequest: deletedById,
      roleNameRequest: roleNameRequest,
      createdById: product.createdById,
    })
    try {
      await this.productRepo.delete({ id: productId, deletedById })
      return {
        message: 'Product deleted successfully',
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw NotFoundRecordException
      }
      throw error
    }
  }
}
