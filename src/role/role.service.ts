import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { RoleRepo } from './role.repo'
import { CreateRoleBodyType, GetRoleQueryType, UpdateRoleBodyType } from './role.model'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import roleName from 'src/shared/constants/role.constant'

@Injectable()
export class RoleService {
  constructor(private readonly roleRepo: RoleRepo) {}
  private async verifyRole(roleId: number) {
    const role = await this.roleRepo.findById(roleId)
    if (!role) {
      throw new NotFoundException('Role not found')
    }
    const baseRoles: string[] = [roleName.Admin, roleName.Client, roleName.Seller]

    if (baseRoles.includes(role.name)) {
      throw new ForbiddenException('You can not update this role')
    }
  }
  async list(pagination: GetRoleQueryType) {
    const data = await this.roleRepo.list(pagination)
    return data
  }

  async findById(id: number) {
    const role = await this.roleRepo.findById(id)
    if (!role) {
      throw new NotFoundException('Role not found')
    }
    return role
  }

  async create({ createdById, data }: { createdById: number; data: CreateRoleBodyType }) {
    try {
      const role = await this.roleRepo.create({
        createdById,
        data,
      })
      return role
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException('Role name already exists')
        }
      }
      throw error
    }
  }

  async update({ updatedById, id, data }: { updatedById: number; id: number; data: UpdateRoleBodyType }) {
    try {
      //kiểm tra người cập nhật có quyền không
      await this.verifyRole(updatedById)
      const role = await this.roleRepo.findById(id)
      if (!role) {
        throw new NotFoundException('Role not found')
      }
      //không cho phép bất kì ai cập nhập role Admin
      if (role.name === roleName.Admin) {
        throw new ForbiddenException('You can not update this role')
      }
      const updatedRole = await this.roleRepo.update({ updatedById, id, data })
      return updatedRole
    } catch (error) {
      if (error instanceof Error) {
        throw new ForbiddenException(error.message)
      }
      throw error
    }
  }

  async delete({ id, deletedById }: { id: number; deletedById: number }, isHard?: boolean) {
    try {
      const role = await this.roleRepo.findById(id)
      if (!role) {
        throw new NotFoundException('Role not found')
      }
      //không cho phép bất kì ai xóa 3 role cơ bản
      if ([roleName.Admin, roleName.Client, roleName.Seller].includes(role.name)) {
        throw new ForbiddenException('You can not delete this role')
      }
      //kiểm tra người xóa có quyền không
      await this.verifyRole(deletedById)
      await this.roleRepo.delete({ id, deletedById }, isHard)
      return {
        message: 'Delete role successfully',
      }
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new BadRequestException('Role not deleted')
        }
      }
      throw error
    }
  }
}
