import { ForbiddenException, Injectable } from '@nestjs/common'
import { UserRepo } from './repository/user.repo'
import { CreateUserBodyType, GetUsersQueryType, UpdateUserBodyType } from './user.model'
import { HashingService } from 'src/shared/service/hashing.service'
import { SharedRoleRepository } from 'src/shared/repositories/shared-role.repo'
import { ShareUserRepository } from 'src/shared/repositories/shared-user.repo'
import { NotFoundRecordException } from 'src/shared/error/error'
import roleName from 'src/shared/constants/role.constant'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { CannotUpdateOrDeleteYourselfException, RoleNotFoundException, UserAlreadyExistsException } from './user.error'

@Injectable()
export class UserService {
  constructor(
    private readonly userRepo: UserRepo,
    private readonly hashingService: HashingService,
    private readonly shareUserRepository: ShareUserRepository,
    private readonly sharedRoleRepository: SharedRoleRepository,
  ) {}

  async list(pagination: GetUsersQueryType) {
    return this.userRepo.list(pagination)
  }
  async findById(id: number) {
    const user = await this.shareUserRepository.findUniqueIncludeRolePermissions({
      id,
    })
    if (!user) {
      throw NotFoundRecordException
    }
    return {
      ...user,
      isTwoFactorEnabled: !!user.totpSecret,
    }
  }
  async create({
    data,
    createdById,
    createdByRoleName,
  }: {
    data: CreateUserBodyType
    createdById: number
    createdByRoleName: string
  }) {
    try {
      //chỉ có admin agent mới có quyền tạo user với role là admin
      await this.verifyRole({
        roleNameAgent: createdByRoleName,
        roleIdTarget: data.roleId,
      })
      // Hash the password
      const hashedPassword = await this.hashingService.hash(data.password)
      // Create the user
      const user = await this.userRepo.create({
        data: {
          ...data,
          password: hashedPassword,
        },
        createdById,
      })
      return {
        ...user,
        isTwoFactorEnabled: !!user.totpSecret,
      }
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2003') {
        throw RoleNotFoundException
      }
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
        throw UserAlreadyExistsException
      }
      throw error
    }
  }
  async update({
    id,
    data,
    updatedById,
    updateByRoleName,
  }: {
    id: number
    data: UpdateUserBodyType
    updatedById: number
    updateByRoleName: string
  }) {
    try {
      //không thể update chính mình
      if (id === updatedById) {
        throw CannotUpdateOrDeleteYourselfException
      }
      const currentUser = await this.getRoleIdByUserId(id)
      //lấy roleId ban đầu của người được update để thực hiện kiểm tra xam liệu người update có quyền update hay không
      const roleIdTarget = currentUser.id
      await this.verifyRole({
        roleNameAgent: updateByRoleName,
        roleIdTarget,
      })
      if (data.password) {
        data.password = await this.hashingService.hash(data.password)
      }
      const updateUser = await this.shareUserRepository.update(
        {
          id,
        },
        {
          ...data,
          updatedById,
        },
      )
      return {
        ...updateUser,
        isTwoFactorEnabled: !!updateUser.totpSecret,
      }
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2003') {
        throw RoleNotFoundException
      }
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
        throw UserAlreadyExistsException
      }
      throw error
    }
  }
  async delete(
    { userId, deletedById, deletedByRoleName }: { userId: number; deletedById: number; deletedByRoleName: string },
    isHard?: boolean,
  ) {
    try {
      //không thể xóa chính mình
      if (userId === deletedById) {
        throw CannotUpdateOrDeleteYourselfException
      }
      const currentUser = await this.getRoleIdByUserId(userId)
      //lấy roleId ban đầu của người được update để thực hiện kiểm tra xam liệu người update có quyền update hay không
      const roleIdTarget = currentUser.id
      await this.verifyRole({
        roleNameAgent: deletedByRoleName,
        roleIdTarget,
      })
      await this.userRepo.delete({ userId, deletedById }, isHard)
      return {
        message: 'Delete user successfully',
      }
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2003') {
        throw RoleNotFoundException
      }

      throw error
    }
  }
  private async verifyRole({ roleNameAgent, roleIdTarget }) {
    //agent là admin thì cho phép
    if (roleNameAgent === roleName.Admin) {
      return true
    } else {
      const adminRoleId = await this.sharedRoleRepository.getAdminRoleId()
      if (roleIdTarget === adminRoleId) {
        throw new ForbiddenException()
      }
      return true
    }
  }
  private async getRoleIdByUserId(userId: number) {
    const currentUser = await this.shareUserRepository.findUnique({
      id: userId,
    })
    if (!currentUser) {
      throw NotFoundRecordException
    }
    return currentUser
  }
}
