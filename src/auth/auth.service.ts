import { BadRequestException, Injectable, UnprocessableEntityException } from '@nestjs/common'
import { addMilliseconds } from 'date-fns'
import { RegisterBodyType, SendOTPBodyType } from 'src/auth/auth.model'
import { AuthRepository } from 'src/auth/repository/auth.repository'
import { VerificationCodeRepository } from 'src/auth/repository/verificationCode.repo'
import { RolesService } from 'src/auth/roles.service'
import { generateOTP } from 'src/shared/helpers'
import { ShareUserRepository } from 'src/shared/repositories/shared-user.repo'
import { HashingService } from 'src/shared/service/hashing.service'
import ms from 'ms'
import envConfig from 'src/shared/config'
@Injectable()
export class AuthService {
  constructor(
    private readonly hashingService: HashingService,
    private readonly authRepository: AuthRepository,
    private readonly rolesService: RolesService,
    private readonly shareUserRepository: ShareUserRepository,
    private readonly verificationCodeRepository: VerificationCodeRepository,
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

  async sendOTP(body: SendOTPBodyType) {
    //1:check email exists
    const user = await this.shareUserRepository.findUnique({ email: body.email })
    if (user) {
      throw new UnprocessableEntityException([
        {
          message: 'Email đã tồn tại',
          path: 'email',
        },
      ])
    }
    //2. Tạo mã OTP
    const code = generateOTP()
    const verificationCode = await this.verificationCodeRepository.createVerificationCode({
      email: body.email,
      code,
      type: body.type,
      expiresAt: addMilliseconds(new Date(), ms(envConfig.OTP_EXPIRES_IN)),
    })
    return verificationCode
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
