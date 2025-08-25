import { BadRequestException, ConflictException, Injectable } from '@nestjs/common'
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
  async register(body: any) {
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
      return user
    } catch (error) {
      throw new BadRequestException('Lỗi Tạo Người Dùng Hãy Thử Lại')
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
