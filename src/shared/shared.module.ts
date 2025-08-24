import { Global, Module } from '@nestjs/common'
import { PrismaService } from 'src/shared/service/prisma.service'
import { HashingService } from './service/hashing.service'
import { TokenService } from './service/token.service'
import { JwtModule } from '@nestjs/jwt'
@Global()
@Module({
  providers: [PrismaService, HashingService, TokenService],
  exports: [PrismaService, HashingService, TokenService],
  imports: [JwtModule],
})
export class SharedModule {}
