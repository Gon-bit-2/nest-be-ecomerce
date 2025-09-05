import { Injectable } from '@nestjs/common'
import { DeviceType, RegisterBodyType, RoleType } from 'src/auth/auth.model'
import { UserType } from 'src/shared/model/shared-user.model'
import { PrismaService } from 'src/shared/service/prisma.service'

@Injectable()
export class AuthRepository {
  constructor(private readonly prismaService: PrismaService) {}
  async createUser(
    user: Omit<RegisterBodyType, 'confirmPassword' | 'code'> & Pick<UserType, 'roleId'>,
  ): Promise<Omit<UserType, 'password' | 'totpSecret'>> {
    return await this.prismaService.user.create({
      data: user,
      omit: {
        password: true,
        totpSecret: true,
      },
    })
  }
  async findUniqueIncludeRole(
    uniqueObject: { email: string } | { id: number },
  ): Promise<(UserType & { role: RoleType }) | null> {
    const user = await this.prismaService.user.findUnique({
      where: uniqueObject,
      include: {
        role: true,
      },
    })
    return user
  }
  async createRefreshToken(data: { token: string; userId: number; expiresAt: Date; deviceId: number }) {
    return await this.prismaService.refreshToken.create({ data })
  }
  async createDevice(
    data: Pick<DeviceType, 'userId' | 'userAgent' | 'ip'> & Partial<Pick<DeviceType, 'isActive' | 'lastActive'>>,
  ) {
    return await this.prismaService.device.create({
      data,
    })
  }
}
