import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/service/prisma.service'
import { CreatePermissionBodyType, GetPermissionsQueryType, UpdatePermissionBodyType } from '../permission.model'
import { PermissionType } from 'src/shared/model/share-permission.model'

@Injectable()
export class PermissionRepo {
  constructor(private readonly prismaService: PrismaService) {}
  async list(pagination: GetPermissionsQueryType) {
    const skip = (pagination.page - 1) * pagination.limit
    const take = pagination.limit
    const [totalItems, data] = await Promise.all([
      this.prismaService.permission.count({
        where: {
          deletedAt: null,
        },
      }),
      this.prismaService.permission.findMany({
        where: {
          deletedAt: null,
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
  findById(id: number) {
    return this.prismaService.permission.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    })
  }
  async create({ createdById, data }: { createdById: number | null; data: CreatePermissionBodyType }) {
    const permission = await this.prismaService.permission.create({
      data: {
        ...data,
        createdById,
      },
    })
    return permission
  }
  async update({
    id,
    updatedById,
    data,
  }: {
    id: number
    updatedById: number | null
    data: UpdatePermissionBodyType
  }): Promise<
    PermissionType & {
      roles: {
        id: number
      }[]
    }
  > {
    const permission = await this.prismaService.permission.update({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        ...data,
        updatedById,
      },
      include: {
        roles: true,
      },
    })
    return permission
  }
  async delete(
    { id, deletedById }: { id: number; deletedById: number | null },
    isHard?: boolean,
  ): Promise<
    PermissionType & {
      roles: {
        id: number
      }[]
    }
  > {
    return isHard
      ? this.prismaService.permission.delete({
          where: {
            id,
          },
          include: {
            roles: true,
          },
        })
      : this.prismaService.permission.update({
          where: {
            id,
            deletedAt: null,
          },
          data: {
            deletedAt: new Date(),
            deletedById,
          },
          include: {
            roles: true,
          },
        })
  }
}
