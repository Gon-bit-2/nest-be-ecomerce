import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/service/prisma.service'
import { CreateCategoryTranslationBodyType, UpdateCategoryTranslationBodyType } from '../category-translation.model'

@Injectable()
export class CategoryTranslationRepo {
  constructor(private readonly prismaService: PrismaService) {}

  async findById({ id }: { id: number }) {
    const categoryTranslation = await this.prismaService.categoryTranslation.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    })
    return categoryTranslation
  }
  async create({ createdById, data }: { createdById: number; data: CreateCategoryTranslationBodyType }) {
    const categoryTranslation = await this.prismaService.categoryTranslation.create({
      data: {
        ...data,
        createdById: createdById,
      },
    })
    return categoryTranslation
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
    const updateCategoryTranslation = await this.prismaService.categoryTranslation.update({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        ...data,
        updatedById: updatedById,
      },
    })
    return updateCategoryTranslation
  }

  async delete({ id, deletedById }: { id: number; deletedById: number }, isHard?: boolean) {
    return isHard
      ? this.prismaService.categoryTranslation.delete({
          where: {
            id,
          },
        })
      : this.prismaService.categoryTranslation.update({
          where: {
            id,
            deletedAt: null,
          },
          data: {
            deletedById,
            deletedAt: new Date(),
          },
        })
  }
}
