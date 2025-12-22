import { BadRequestException, Injectable } from '@nestjs/common'
import { NotFoundRecordException } from 'src/shared/error/error'

import { ShareUserRepository } from 'src/shared/repositories/shared-user.repo'
import { HashingService } from 'src/shared/service/hashing.service'
import { ChangePasswordBodyType, UpdateMeBodyType } from './profile.model'

@Injectable()
export class ProfileService {
  constructor(
    private readonly shareUserRepository: ShareUserRepository,
    private readonly hashingService: HashingService,
  ) {}
  async getProfile(userId: number) {
    const user = await this.shareUserRepository.findUniqueIncludeRolePermissions({ id: userId })
    if (!user) {
      throw NotFoundRecordException
    }
    return user
  }
  async updateProfile({ userId, body }: { userId: number; body: UpdateMeBodyType }) {
    const user = await this.shareUserRepository.findUnique({ id: userId })
    if (!user) {
      throw NotFoundRecordException
    }
    const updateUser = await this.shareUserRepository.update({ id: userId }, body)
    return updateUser
  }
  async changePassword({ userId, body }: { userId: number; body: Omit<ChangePasswordBodyType, 'confirmPassword'> }) {
    try {
      const user = await this.shareUserRepository.findUnique({ id: userId })
      if (!user) {
        throw NotFoundRecordException
      }
      const isMatch = await this.hashingService.compare(body.password, user.password)
      if (!isMatch) {
        throw new BadRequestException('Old password is not correct')
      }
      const hashedPassword = await this.hashingService.hash(body.newPassword)
      await this.shareUserRepository.update({ id: userId }, { password: hashedPassword, updatedById: userId })
      return {
        message: 'Change password successfully',
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw NotFoundRecordException
      }
      throw error
    }
  }
}
