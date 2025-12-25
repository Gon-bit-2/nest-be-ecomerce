import { Injectable } from '@nestjs/common'
import { CreateBrandBodyType, UpdateBrandBodyType } from 'src/brand/brand.model'
import { PaginationQueryType } from 'src/shared/model/request.model'
import { PrismaService } from 'src/shared/service/prisma.service'

@Injectable()
export class BrandRepo {
  constructor(private readonly prismaService: PrismaService) {}
  async list(pagination: PaginationQueryType, languageId?: string) {
    const skip = (pagination.page - 1) * pagination.limit
    const take = pagination.limit
    const [totalItems, data] = await Promise.all([
      this.prismaService.brand.count({
        where: {
          deletedAt: null,
        },
      }),
      this.prismaService.brand.findMany({
        where: {
          deletedAt: null,
        },
        include: {
          brandTranslations: {
            where: languageId ? { deletedAt: null, languageId } : { deletedAt: null },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take,
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
  findById(id: number, languageId?: string) {
    return this.prismaService.brand.findUnique({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        brandTranslations: {
          where: languageId ? { deletedAt: null, languageId } : { deletedAt: null },
        },
      },
    })
  }
  create({ createdById, data }: { createdById: number; data: CreateBrandBodyType }) {
    return this.prismaService.brand.create({
      data: {
        ...data,
        createdById,
      },
      include: {
        brandTranslations: {
          where: { deletedAt: null },
        },
      },
    })
  }
  update({ id, updatedById, data }: { id: number; updatedById: number; data: UpdateBrandBodyType }) {
    return this.prismaService.brand.update({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        ...data,
        updatedById,
      },
      include: {
        brandTranslations: {
          where: { deletedAt: null },
        },
      },
    })
  }
  delete({ id, deletedById }: { id: number; deletedById: number }, isHard?: boolean) {
    return isHard
      ? this.prismaService.brand.delete({
          where: {
            id,
          },
        })
      : this.prismaService.brand.update({
          where: {
            id,
            deletedAt: null,
          },
          data: {
            deletedAt: new Date(),
            deletedById,
          },
        })
  }
}
