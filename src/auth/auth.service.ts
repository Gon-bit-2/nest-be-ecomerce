import { BadRequestException, ConflictException, Injectable } from '@nestjs/common'
import { RegisterBodyDTO } from 'src/auth/dto/auth.dto'
import { RolesService } from 'src/auth/roles.service'
import { HashingService } from 'src/shared/service/hashing.service'
import { PrismaService } from 'src/shared/service/prisma.service'
import { TokenService } from 'src/shared/service/token.service'

@Injectable()
export class AuthService {
  constructor(
    private readonly hashingService: HashingService,
    private readonly prismaService: PrismaService,
    private readonly tokenService: TokenService,
    private readonly rolesService: RolesService,
  ) {}
  async register(body: RegisterBodyDTO) {
    try {
      const clientRoleId = await this.rolesService.getClientRoleId()
      const hashedPassword = await this.hashingService.hash(body.password)
      const existsEmail = await this.prismaService.user.findUnique({
        where: {
          email: body.email,
        },
      })
      if (existsEmail) {
        throw new ConflictException('Email Đã Tồn Tại')
      }
      const user = await this.prismaService.user.create({
        data: {
          email: body.email,
          password: hashedPassword,
          name: body.name,
          phoneNumber: body.phoneNumber,
          roleId: clientRoleId,
        },
        omit: {
          password: true,
          totpSecret: true,
        },
      })
      // const [accessToken, refreshToken] = await Promise.all([
      //   this.tokenService.signAccessToken({ userId: user.id }),
      //   this.tokenService.signRefreshToken({ userId: user.id }),
      // ])
      // if (refreshToken) {
      //   await this.prismaService.refreshToken.create({
      //     data: {
      //       token: refreshToken,
      //       userId: user.id,
      //       expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      //     },
      //   })
      // }

      return user
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException('Người Dùng Đã Tồn Tại')
      }
    }
  }

  login(body: any) {
    return `This action returns all auth`
  }

  refreshToken(body: any) {
    return `This action returns a #${body} auth`
  }

  logout(refreshToken: string) {
    return `This action updates a #${refreshToken} auth`
  }

  remove(id: number) {
    return `This action removes a #${id} auth`
  }
}
