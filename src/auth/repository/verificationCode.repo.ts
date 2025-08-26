import { Injectable } from '@nestjs/common'
import { VerificationCodeType } from 'src/auth/auth.model'
import { PrismaService } from 'src/shared/service/prisma.service'
@Injectable()
export class VerificationCodeRepository {
  constructor(private readonly prismaService: PrismaService) {}
  async createVerificationCode(
    payload: Pick<VerificationCodeType, 'email' | 'type' | 'code' | 'expiresAt'>,
  ): Promise<VerificationCodeType> {
    return this.prismaService.verificationCode.upsert({
      where: {
        email: payload.email,
      },
      create: payload,
      update: {
        code: payload.code,
        expiresAt: payload.expiresAt,
      },
    })
  }
}
