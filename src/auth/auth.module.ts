import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'

import { AuthRepository } from 'src/auth/repository/auth.repository'
import { VerificationCodeRepository } from 'src/auth/repository/verificationCode.repo'
import { GoogleService } from './google.service'
import { SharedRoleRepository } from 'src/shared/repositories/shared-role.repo'

@Module({
  controllers: [AuthController],
  providers: [AuthService, GoogleService, AuthRepository, VerificationCodeRepository, SharedRoleRepository],
})
export class AuthModule {}
