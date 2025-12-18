import { Injectable } from '@nestjs/common'
import { UserType } from 'src/shared/model/shared-user.model'
import { PrismaService } from 'src/shared/service/prisma.service'
import { PermissionType } from '../model/share-permission.model'
import { RoleType } from '../model/share-role.model'

export type WhereUniqueUserType = { id: number; [key: string]: any } | { email: string; [key: string]: any }
export type UserIncludeRolePermissionType = UserType & {
  role: RoleType & {
    permissions: PermissionType[]
  }
}
@Injectable()
export class ShareUserRepository {
  constructor(private readonly prismaService: PrismaService) {}
  async findUnique(uniqueObject: WhereUniqueUserType): Promise<UserType | null> {
    return await this.prismaService.user.findUnique({ where: uniqueObject })
  }
  async findUniqueIncludeRolePermissions(where: WhereUniqueUserType): Promise<UserIncludeRolePermissionType | null> {
    return await this.prismaService.user.findUnique({
      where,
      include: {
        role: {
          include: {
            permissions: {
              where: {
                deletedAt: null,
              },
            },
          },
        },
      },
    })
  }
  async update(where: WhereUniqueUserType, data: Partial<UserType>) {
    return await this.prismaService.user.update({ where, data })
  }
}
