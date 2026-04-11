import { Injectable, NotFoundException } from '@nestjs/common'
import { CategoryRepo } from './repository/category.repo'
import { CreateCategoryBodyType, UpdateCategoryBodyType } from './category.model'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { NotFoundRecordException } from 'src/shared/error/error'
import { I18nContext } from 'nestjs-i18n'

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepo: CategoryRepo) {}

  async create({ createdById, data }: { createdById: number; data: CreateCategoryBodyType }) {
    try {
      return await this.categoryRepo.create({ createdById, data })
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new Error('Category name already exists')
        }
        if (error.code === 'P2003') {
          throw new Error('Parent category not found')
        }
      }
      throw error
    }
  }

  async findAll({ parentCategoryId }: { parentCategoryId?: number | null }) {
    return await this.categoryRepo.findAll({ parentCategoryId, languageId: I18nContext.current()?.lang as string })
  }

  async findById({ id }: { id: number }) {
    try {
      return await this.categoryRepo.findById({ id, languageId: I18nContext.current()?.lang as string })
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Category not found')
        }
      }
      if (error instanceof NotFoundException) {
        throw NotFoundRecordException
      }
      throw error
    }
  }

  async update({ id, data, updatedById }: { id: number; data: UpdateCategoryBodyType; updatedById: number }) {
    if (data.parentCategoryId === id) {
      throw new Error('A category cannot be its own parent')
    }

    // Nếu client vô tình gửi parentCategoryId = 0 để biểu thị "không có danh mục cha", chuyển nó thành null
    if (data.parentCategoryId === 0) {
      data.parentCategoryId = null
    }

    try {
      return await this.categoryRepo.update({ id, data, updatedById })
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Category not found')
        }
        if (error.code === 'P2003') {
          throw new Error('Parent category not found')
        }
      }
      if (error instanceof NotFoundException) {
        throw NotFoundRecordException
      }
      throw error
    }
  }

  async delete({ id, deletedById }: { id: number; deletedById: number }) {
    try {
      await this.categoryRepo.delete({ id, deletedById })
      return {
        message: 'Category deleted successfully',
      }
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Category not found')
        }
      }
      if (error instanceof NotFoundException) {
        throw NotFoundRecordException
      }
      throw error
    }
  }
}
