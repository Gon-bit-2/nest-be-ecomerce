import { Global, Module } from '@nestjs/common'
import { PrismaService } from 'src/shared/service/prisma.service'
import { HashingService } from './service/hashing.service'
import { TokenService } from './service/token.service'
import { JwtModule } from '@nestjs/jwt'
import { ShareUserRepository } from 'src/shared/repositories/shared-user.repo'
import { EmailService } from 'src/shared/service/email.service'
import { AccessTokenGuard } from 'src/shared/guard/access-token.guard'
import { XApiKeyGuard } from 'src/shared/guard/x-api-key.guard'
import { TwoFactorAuthService } from './service/2fa.service'
@Global()
@Module({
  providers: [
    PrismaService,
    HashingService,
    TokenService,
    TwoFactorAuthService,
    ShareUserRepository,
    EmailService,
    AccessTokenGuard,
    XApiKeyGuard,
  ],
  exports: [
    PrismaService,
    HashingService,
    TokenService,
    TwoFactorAuthService,
    ShareUserRepository,
    EmailService,
    AccessTokenGuard,
    XApiKeyGuard,
  ],
  imports: [JwtModule],
})
export class SharedModule {}
