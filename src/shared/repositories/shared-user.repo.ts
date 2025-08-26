import { Injectable } from '@nestjs/common'
import { UserType } from 'src/shared/model/shared-user.model'
import { PrismaService } from 'src/shared/service/prisma.service'

@Injectable()
export class ShareUserRepository {
  constructor(private readonly prismaService: PrismaService) {}
  async findUnique(uniqueObject: { email: string } | { id: number }): Promise<UserType | null> {
    return await this.prismaService.user.findUnique({ where: uniqueObject })
  }
}
