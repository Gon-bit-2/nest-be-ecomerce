import { Injectable } from '@nestjs/common'
import { ALL_LANGUAGE_CODE } from 'src/shared/constants/other.constant'
import { PrismaService } from 'src/shared/service/prisma.service'
import { CreateCategoryBodyType, UpdateCategoryBodyType } from '../category.model'

@Injectable()
export class CategoryRepo {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll({ parentCategoryId, languageId }: { parentCategoryId?: number | null; languageId: string }) {
    const categories = await this.prismaService.category.findMany({
      where: {
        deletedAt: null,
        parentCategoryId: parentCategoryId ?? null,
      },
      include: {
        categoryTranslations: {
          where: languageId === ALL_LANGUAGE_CODE ? { deletedAt: null } : { languageId: languageId, deletedAt: null },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    return {
      data: categories,
      totalItems: categories.length,
    }
  }
  async findById({ id, languageId }: { id: number; languageId: string }) {
    const category = await this.prismaService.category.findUnique({
      where: {
        id: id,
        deletedAt: null,
      },
      include: {
        categoryTranslations: {
          where: languageId === ALL_LANGUAGE_CODE ? { deletedAt: null } : { languageId: languageId, deletedAt: null },
        },
      },
    })
    return category
  }

  async create({ createdById, data }: { createdById: number; data: CreateCategoryBodyType }) {
    const category = await this.prismaService.category.create({
      data: {
        ...data,
        createdById: createdById,
      },
      include: {
        categoryTranslations: {
          where: { deletedAt: null },
        },
      },
    })
    return category
  }
  async update({ id, data, updatedById }: { id: number; data: UpdateCategoryBodyType; updatedById: number }) {
    const updateCategory = await this.prismaService.category.update({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        ...data,
        updatedById: updatedById,
      },
      include: {
        categoryTranslations: {
          where: { deletedAt: null },
        },
      },
    })
    return updateCategory
  }
  async delete(
    {
      id,
      deletedById,
    }: {
      id: number
      deletedById: number
    },
    isHard?: boolean,
  ) {
    return isHard
      ? this.prismaService.category.delete({
          where: {
            id,
          },
        })
      : this.prismaService.category.update({
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
