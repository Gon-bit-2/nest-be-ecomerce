import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { PrismaService } from 'src/shared/service/prisma.service'

@Injectable()
export class RemoveRefreshTokenCronJob {
  constructor(private readonly prismaService: PrismaService) {}
  private readonly logger = new Logger(RemoveRefreshTokenCronJob.name)

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async handleCron() {
    const refreshTokens = await this.prismaService.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    })
    this.logger.log(`Removed ${refreshTokens.count} expired refresh tokens`)
  }
}
