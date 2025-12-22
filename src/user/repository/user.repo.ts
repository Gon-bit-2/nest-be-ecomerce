import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/service/prisma.service'
import { CreateUserBodyType, GetUsersQueryType } from '../user.model'

@Injectable()
export class UserRepo {
  constructor(private readonly prismaService: PrismaService) {}

  async list(pagination: GetUsersQueryType) {
    const skip = (pagination.page - 1) * pagination.limit
    const take = pagination.limit
    const [totalItems, data] = await Promise.all([
      this.prismaService.user.count({
        where: {
          deletedAt: null,
        },
      }),
      this.prismaService.user.findMany({
        where: {
          deletedAt: null,
        },
        skip,
        take,
        include: {
          role: true,
        },
      }),
    ])
    return {
      data,
      totalItem: totalItems,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(totalItems / pagination.limit),
    }
  }
  create({ data, createdById }: { data: CreateUserBodyType; createdById: number }) {
    return this.prismaService.user.create({
      data: {
        ...data,
        createdById,
      },
    })
  }
  delete({ userId, deletedById }: { userId: number; deletedById: number }, isHard?: boolean) {
    return isHard
      ? this.prismaService.user.delete({
          where: {
            id: userId,
          },
        })
      : this.prismaService.user.update({
          where: {
            id: userId,
            deletedAt: null,
          },
          data: {
            deletedById,
            deletedAt: new Date(),
          },
        })
  }
}
