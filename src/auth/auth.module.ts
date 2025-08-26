import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { RolesService } from 'src/auth/roles.service'
import { AuthRepository } from 'src/auth/repository/auth.repository'

@Module({
  controllers: [AuthController],
  providers: [AuthService, RolesService, AuthRepository],
})
export class AuthModule {}
