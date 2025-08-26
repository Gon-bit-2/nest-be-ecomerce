import { BadRequestException, Injectable } from '@nestjs/common'
import { RegisterBodyType } from 'src/auth/auth.model'
import { AuthRepository } from 'src/auth/repository/auth.repository'
import { RolesService } from 'src/auth/roles.service'
import { HashingService } from 'src/shared/service/hashing.service'

@Injectable()
export class AuthService {
  constructor(
    private readonly hashingService: HashingService,
    private readonly authRepository: AuthRepository,
    private readonly rolesService: RolesService,
  ) {}
  async register(body: RegisterBodyType) {
    try {
      const clientRoleId = await this.rolesService.getClientRoleId()
      const hashedPassword = await this.hashingService.hash(body.password)
      const user = await this.authRepository.createUser({
        email: body.email,
        password: hashedPassword,
        name: body.name,
        phoneNumber: body.phoneNumber,
        roleId: clientRoleId,
      })
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
