import { Injectable, NotFoundException } from '@nestjs/common'
import { ProductRepo } from './repository/product.repo'
import { CreateProductBodyType, GetProductsQueryType, UpdateProductBodyType } from './product.model'
import { I18nContext } from 'nestjs-i18n'
import { NotFoundRecordException } from 'src/shared/error/error'

@Injectable()
export class ProductService {
  constructor(private readonly productRepo: ProductRepo) {}

  async list(query: GetProductsQueryType) {
    return this.productRepo.list(query, I18nContext.current()?.lang as string)
  }
  async finById(id: number) {
    const product = await this.productRepo.findById({ id, languageId: I18nContext.current()?.lang as string })
    if (!product) {
      throw NotFoundRecordException
    }
    return product
  }
  async create({ data, createdById }: { data: CreateProductBodyType; createdById: number }) {
    const product = await this.productRepo.create({ data, createdById })
    return product
  }
  async update({ id, data, updatedById }: { id: number; data: UpdateProductBodyType; updatedById: number }) {
    try {
      const product = await this.productRepo.update({ id, data, updatedById })
      return product
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw NotFoundRecordException
      }
      throw error
    }
  }
  async delete({ id, deletedById }: { id: number; deletedById: number }) {
    try {
      await this.productRepo.delete({ id, deletedById })
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
