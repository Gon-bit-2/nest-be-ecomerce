import { Global, Module } from '@nestjs/common'
import { PrismaService } from 'src/shared/service/prisma.service'
import { HashingService } from './service/hashing.service'
import { TokenService } from './service/token.service'
import { JwtModule } from '@nestjs/jwt'
import { ShareUserRepository } from 'src/shared/repositories/shared-user.repo'
import { EmailService } from 'src/shared/service/email.service'
import { AccessTokenGuard } from 'src/shared/guard/access-token.guard'
import { PaymentApiKeyGuard } from 'src/shared/guard/payment-api-key.guard'
import { TwoFactorAuthService } from './service/2fa.service'
import { S3Service } from 'src/shared/service/s3.service'
@Global()
@Module({
  providers: [
    PrismaService,
    HashingService,
    TokenService,
    S3Service,
    TwoFactorAuthService,
    ShareUserRepository,
    EmailService,
    AccessTokenGuard,
    PaymentApiKeyGuard,
  ],
  exports: [
    PrismaService,
    HashingService,
    TokenService,
    S3Service,
    TwoFactorAuthService,
    ShareUserRepository,
    EmailService,
    AccessTokenGuard,
    PaymentApiKeyGuard,
  ],
  imports: [JwtModule],
})
export class SharedModule {}
