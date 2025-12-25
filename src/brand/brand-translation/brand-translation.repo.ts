import { Injectable } from '@nestjs/common'
import { CreateBrandTranslationBodyType } from 'src/brand/brand-translation/brand-translation.model'
import { PrismaService } from 'src/shared/service/prisma.service'

@Injectable()
export class BrandTranslationRepo {
  constructor(private readonly prismaService: PrismaService) {}
  findById(id: number) {
    return this.prismaService.brandTranslation.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    })
  }
  create({ createdById, data }: { createdById: number; data: CreateBrandTranslationBodyType }) {
    return this.prismaService.brandTranslation.create({
      data: {
        ...data,
        createdById,
      },
    })
  }
  update({
    id,
    updatedById,
    data,
  }: {
    id: number
    updatedById: number
    data: Partial<CreateBrandTranslationBodyType>
  }) {
    return this.prismaService.brandTranslation.update({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        ...data,
        updatedById,
      },
    })
  }
  delete({ id, deletedById }: { id: number; deletedById: number }, isHard?: boolean) {
    return isHard
      ? this.prismaService.brandTranslation.delete({
          where: {
            id,
          },
        })
      : this.prismaService.brandTranslation.update({
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
