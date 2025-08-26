import { Global, Module } from '@nestjs/common'
import { PrismaService } from 'src/shared/service/prisma.service'
import { HashingService } from './service/hashing.service'
import { TokenService } from './service/token.service'
import { JwtModule } from '@nestjs/jwt'
import { ShareUserRepository } from 'src/shared/repositories/shared-user.repo'
@Global()
@Module({
  providers: [PrismaService, HashingService, TokenService, ShareUserRepository],
  exports: [PrismaService, HashingService, TokenService, ShareUserRepository],
  imports: [JwtModule],
})
export class SharedModule {}
