import { Module } from '@nestjs/common'
import { UserService } from './user.service'
import { UserController } from './user.controller'
import { UserRepo } from './repository/user.repo'
import { HashingService } from 'src/shared/service/hashing.service'
import { SharedRoleRepository } from 'src/shared/repositories/shared-role.repo'
import { ShareUserRepository } from 'src/shared/repositories/shared-user.repo'

@Module({
  controllers: [UserController],
  providers: [UserService, UserRepo, HashingService, SharedRoleRepository, ShareUserRepository],
})
export class UserModule {}
