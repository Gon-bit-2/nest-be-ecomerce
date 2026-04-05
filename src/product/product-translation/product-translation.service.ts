import { Injectable, NotFoundException } from '@nestjs/common'
import { ProductTranslationRepo } from './repository/product-translation.repo'
import { NotFoundRecordException } from 'src/shared/error/error'
import { CreateProductTranslationBodyType, UpdateProductTranslationBodyType } from './product-translation.model'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'

@Injectable()
export class ProductTranslationService {
  constructor(private readonly productTranslationRepo: ProductTranslationRepo) {}
  async findById(id: number) {
    const productTranslation = await this.productTranslationRepo.findById(id)
    if (!productTranslation) {
      throw NotFoundRecordException
    }
    return productTranslation
  }
  async create({ createdById, data }: { createdById: number; data: CreateProductTranslationBodyType }) {
    try {
      return await this.productTranslationRepo.create({ data, createdById })
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2003') {
        throw NotFoundRecordException
      }
      if (error instanceof NotFoundException) {
        throw NotFoundRecordException
      }
      throw error
    }
  }
  async update({ updatedById, id, data }: { updatedById: number; id: number; data: UpdateProductTranslationBodyType }) {
    try {
      return await this.productTranslationRepo.update({ updatedById, id, data })
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2003') {
        throw NotFoundRecordException
      }
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
        throw NotFoundRecordException
      }
      if (error instanceof NotFoundException) {
        throw NotFoundRecordException
      }
      throw error
    }
  }
  async delete({ deletedById, id }: { deletedById: number; id: number }) {
    try {
      return await this.productTranslationRepo.delete({ deletedById, id })
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
        throw NotFoundRecordException
      }
      if (error instanceof NotFoundException) {
        throw NotFoundRecordException
      }
      throw error
    }
  }
}
