import { BadRequestException, Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/service/prisma.service'
import { CreateRoleBodyType, GetRoleQueryType, UpdateRoleBodyType } from './role.model'
import { RoleType } from 'src/shared/model/share-role.model'

@Injectable()
export class RoleRepo {
  constructor(private readonly prismaService: PrismaService) {}

  async list(pagination: GetRoleQueryType) {
    const skip = (pagination.page - 1) * pagination.limit
    const take = pagination.limit
    const [totalItems, data] = await Promise.all([
      this.prismaService.role.count({
        where: {
          deletedAt: null,
        },
      }),
      this.prismaService.role.findMany({
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
  async findById(id: number) {
    return this.prismaService.role.findUniqueOrThrow({
      where: {
        deletedAt: null,
        id,
      },
      include: {
        permissions: {
          where: {
            deletedAt: null,
          },
        },
      },
    })
  }
  create({ createdById, data }: { createdById: number | null; data: CreateRoleBodyType }): Promise<RoleType> {
    return this.prismaService.role.create({
      data: {
        ...data,
        createdById,
      },
    })
  }
  async update({ updatedById, id, data }: { updatedById: number; id: number; data: UpdateRoleBodyType }) {
    //kiểm tra nếu có permission Id mà đã soft delete thì không cho cập nhập
    if (data.permissionIds.length > 0) {
      const permissionIds = await this.prismaService.permission.findMany({
        where: {
          id: {
            in: data.permissionIds,
          },
        },
      })
      const deletedPermissionIds = permissionIds.filter((permission) => permission.deletedAt)
      if (deletedPermissionIds.length > 0) {
        const deletedIds = deletedPermissionIds.map((permission) => permission.id).join(', ')
        throw new BadRequestException(`Permission with id has been deleted: ${deletedIds}`)
      }
    }
    return await this.prismaService.role.update({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        name: data.name,
        description: data.description,
        isActive: data.isActive,
        permissions: {
          set: data.permissionIds.map((id) => ({ id })),
        },
        updatedById,
      },
      include: {
        permissions: {
          where: {
            deletedAt: null,
          },
        },
      },
    })
  }
  delete({ id, deletedById }: { id: number; deletedById: number }, isHard?: boolean) {
    return isHard
      ? this.prismaService.role.delete({
          where: {
            id,
          },
        })
      : this.prismaService.role.update({
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
