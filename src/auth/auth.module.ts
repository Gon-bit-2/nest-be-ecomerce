import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { RolesService } from 'src/auth/roles.service'
import { AuthRepository } from 'src/auth/repository/auth.repository'
import { VerificationCodeRepository } from 'src/auth/repository/verificationCode.repo'
import { GoogleService } from './google.service'

@Module({
  controllers: [AuthController],
  providers: [AuthService, RolesService, GoogleService, AuthRepository, VerificationCodeRepository],
})
export class AuthModule {}
