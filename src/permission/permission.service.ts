import { Injectable, NotFoundException } from '@nestjs/common'
import { PermissionRepo } from './repository/permission.repo'
import { CreatePermissionBodyType, GetPermissionsQueryType, UpdatePermissionBodyType } from './permission.model'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/binary'

@Injectable()
export class PermissionService {
  constructor(private readonly permissionRepo: PermissionRepo) {}
  async list(pagination: GetPermissionsQueryType) {
    const data = await this.permissionRepo.list(pagination)
    return data
  }
  async findById(id: number) {
    const permission = await this.permissionRepo.findById(id)
    if (!permission) {
      throw new Error('Permission not found')
    }
    return permission
  }
  async create({ data, createdById }: { data: CreatePermissionBodyType; createdById: number | null }) {
    try {
      const permission = await this.permissionRepo.create({ data, createdById })
      return permission
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new Error('Permission already exists')
      }
      throw error
    }
  }
  async update({ id, data, updatedById }: { id: number; data: UpdatePermissionBodyType; updatedById: number | null }) {
    try {
      const permission = await this.permissionRepo.update({ id, data, updatedById })
      return permission
    } catch (error) {
      if (error) {
        throw new NotFoundException('Permission not found')
      }
      throw error
    }
  }
  async delete({ id, deletedById }: { id: number; deletedById: number | null }) {
    try {
      await this.permissionRepo.delete({ id, deletedById })
      return {
        message: 'Permission deleted successfully',
      }
    } catch (error) {
      if (error) {
        throw new NotFoundException('Permission not found')
      }
      throw error
    }
  }
}
