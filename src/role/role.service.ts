import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { RoleRepo } from './role.repo'
import { CreateRoleBodyType, GetRoleQueryType, UpdateRoleBodyType } from './role.model'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'

@Injectable()
export class RoleService {
  constructor(private readonly roleRepo: RoleRepo) {}

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

  async create({ createdById, data }: { createdById: number | null; data: CreateRoleBodyType }) {
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
      const role = await this.roleRepo.update({ updatedById, id, data })
      return role
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('Role not found')
        }
      }
      throw error
    }
  }

  async delete({ id, deletedById }: { id: number; deletedById: number }, isHard?: boolean) {
    try {
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
