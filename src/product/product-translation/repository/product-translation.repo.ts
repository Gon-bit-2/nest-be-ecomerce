import { Injectable } from '@nestjs/common'

import { PrismaService } from 'src/shared/service/prisma.service'
import { CreateProductTranslationBodyType } from '../product-translation.model'

@Injectable()
export class ProductTranslationRepo {
  constructor(private readonly prismaService: PrismaService) {}
  findById(id: number) {
    return this.prismaService.productTranslation.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    })
  }
  create({ createdById, data }: { createdById: number; data: CreateProductTranslationBodyType }) {
    return this.prismaService.productTranslation.create({
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
    data: Partial<CreateProductTranslationBodyType>
  }) {
    return this.prismaService.productTranslation.update({
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
      ? this.prismaService.productTranslation.delete({
          where: {
            id,
          },
        })
      : this.prismaService.productTranslation.update({
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
