import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { CategoryTranslationRepo } from './repository/category-translation.repo'
import { CreateCategoryTranslationBodyType, UpdateCategoryTranslationBodyType } from './category-translation.model'
import { NotFoundRecordException } from 'src/shared/error/error'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'

@Injectable()
export class CategoryTransalitonService {
  constructor(private readonly categoryTranslationRepo: CategoryTranslationRepo) {}
  async findById({ id }: { id: number }) {
    return this.categoryTranslationRepo.findById({ id })
  }
  async create({ createdById, data }: { createdById: number; data: CreateCategoryTranslationBodyType }) {
    try {
      return this.categoryTranslationRepo.create({ createdById, data })
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException('Category translation already exists')
        }
      }
      if (error instanceof NotFoundException) {
        throw NotFoundRecordException
      }
      throw error
    }
  }
  async update({
    id,
    data,
    updatedById,
  }: {
    id: number
    data: UpdateCategoryTranslationBodyType
    updatedById: number
  }) {
    try {
      return this.categoryTranslationRepo.update({ id, data, updatedById })
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('Category translation not found')
        }
      }
      if (error instanceof NotFoundException) {
        throw NotFoundRecordException
      }
      throw error
    }
  }
  delete({ id, deletedById }: { id: number; deletedById: number }) {
    try {
      return this.categoryTranslationRepo.delete({ id, deletedById })
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('Category translation not found')
        }
      }
      if (error instanceof NotFoundException) {
        throw NotFoundRecordException
      }
      throw error
    }
  }
}
