import { Injectable } from '@nestjs/common'
import { RegisterBodyType } from 'src/auth/auth.model'
import { UserType } from 'src/shared/model/shared-user.model'
import { PrismaService } from 'src/shared/service/prisma.service'

@Injectable()
export class AuthRepository {
  constructor(private readonly prismaService: PrismaService) {}
  async createUser(
    user: Omit<RegisterBodyType, 'confirmPassword'> & Pick<UserType, 'roleId'>,
  ): Promise<Omit<UserType, 'password' | 'totpSecret'>> {
    return await this.prismaService.user.create({
      data: user,
      omit: {
        password: true,
        totpSecret: true,
      },
    })
  }
}
