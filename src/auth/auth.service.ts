import {
  BadRequestException,
  HttpException,
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common'
import { addMilliseconds } from 'date-fns'
import {
  DisableTwoFactorBodyType,
  ForgotPasswordBodyType,
  LoginBodyType,
  RefreshTokenBodyType,
  RegisterBodyType,
  SendOTPBodyType,
} from 'src/auth/auth.model'
import { AuthRepository } from 'src/auth/repository/auth.repository'
import { VerificationCodeRepository } from 'src/auth/repository/verificationCode.repo'
import { RolesService } from 'src/auth/roles.service'
import { generateOTP } from 'src/shared/helpers'
import { ShareUserRepository } from 'src/shared/repositories/shared-user.repo'
import { HashingService } from 'src/shared/service/hashing.service'
import ms, { StringValue } from 'ms'
import envConfig from 'src/shared/config'
import { TypeOfVerificationCode, TypeOfVerificationCodeType } from 'src/shared/constants/auth.constant'
import { EmailService } from 'src/shared/service/email.service'
import { TokenService } from 'src/shared/service/token.service'
import { IAccessTokenPayload } from 'src/shared/types/jwt.type'
import { TwoFactorAuthService } from 'src/shared/service/2fa.service'
@Injectable()
export class AuthService {
  constructor(
    private readonly rolesService: RolesService,
    private readonly emailService: EmailService,
    private readonly tokenService: TokenService,
    private readonly hashingService: HashingService,
    private readonly twoFactorAuthService: TwoFactorAuthService,
    private readonly authRepository: AuthRepository,
    private readonly shareUserRepository: ShareUserRepository,
    private readonly verificationCodeRepository: VerificationCodeRepository,
  ) {}
  async register(body: RegisterBodyType) {
    try {
      const verificationCode = await this.verificationCodeRepository.findUniqueVerificationCode({
        email_code_type: {
          email: body.email,
          code: body.code,
          type: TypeOfVerificationCode.REGISTER,
        },
      })
      // console.log('VerificationCode:::::', verificationCode)

      if (!verificationCode) {
        throw new UnprocessableEntityException({
          message: 'Mã OTP không hợp lệ',
          path: 'code',
        })
      }
      if (verificationCode.expiresAt < new Date()) {
        throw new UnprocessableEntityException({
          message: 'Mã OTP đã hết hạn',
          path: 'code',
        })
      }
      const clientRoleId = await this.rolesService.getClientRoleId()
      const hashedPassword = await this.hashingService.hash(body.password)
      const [user] = await Promise.all([
        this.authRepository.createUser({
          email: body.email,
          password: hashedPassword,
          name: body.name,
          phoneNumber: body.phoneNumber,
          roleId: clientRoleId,
        }),
        this.verificationCodeRepository.deleteVerificationCode({
          email_code_type: {
            email: body.email,
            code: body.code,
            type: TypeOfVerificationCode.REGISTER,
          },
        }),
      ])
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
    if (body.type === TypeOfVerificationCode.REGISTER && user) {
      throw new UnprocessableEntityException([
        {
          message: 'Email đã tồn tại',
          path: 'email',
        },
      ])
    }
    if (body.type === TypeOfVerificationCode.FORGOT_PASSWORD && !user) {
      throw new UnprocessableEntityException([
        {
          message: 'Email không tồn tại',
          path: 'email',
        },
      ])
    }
    //2. Tạo mã OTP
    const code = generateOTP()
    await this.verificationCodeRepository.createVerificationCode({
      email: body.email,
      code,
      type: body.type,
      expiresAt: addMilliseconds(new Date(), ms(envConfig.OTP_EXPIRES_IN as StringValue)),
    })
    const { error } = await this.emailService.sendOTPToEMAIL({
      email: body.email,
      code,
    })
    if (error) {
      throw new UnprocessableEntityException({
        message: 'Send OTP FAIL',
        path: 'Code',
      })
    }
    return {
      message: 'Gửi Mã Otp thành công',
    }
  }
  async validateVerificationCode({
    email,
    code,
    type,
  }: {
    email: string
    code: string
    type: TypeOfVerificationCodeType
  }) {
    const verificationCode = await this.authRepository.findUniqueVerificationCode({
      email,
      code,
      type,
    })
    if (!verificationCode) {
      throw new UnprocessableEntityException([
        {
          message: 'Mã OTP không hợp lệ',
          path: 'code',
        },
      ])
    }
    if (verificationCode.expiresAt < new Date()) {
      throw new UnprocessableEntityException([
        {
          message: 'Mã OTP đã hết hạn',
          path: 'code',
        },
      ])
    }
    return verificationCode
  }
  async login(body: LoginBodyType & { userAgent: string; ip: string }) {
    try {
      const user = await this.authRepository.findUniqueIncludeRole({
        email: body.email,
      })
      if (!user) {
        throw new UnprocessableEntityException([
          {
            message: 'Email Không Tồn Tại',
            path: 'email',
          },
        ])
      }
      const isMatchPassword = await this.hashingService.compare(body.password, user.password)
      if (!isMatchPassword) {
        throw new UnprocessableEntityException([
          {
            message: 'Mật Khẩu Không Đúng',
            path: 'password',
          },
        ])
      }
      //
      if (user.totpSecret) {
        if (!body.totpCode && !body.code) {
          throw new UnprocessableEntityException([
            {
              message: 'Mã OTP không hợp lệ',
              path: 'code',
            },
          ])
        }
        if (body.totpCode) {
          const isValid = this.twoFactorAuthService.verifyToken({
            email: user.email,
            token: body.totpCode,
            secret: user.totpSecret,
          })
          if (!isValid) {
            throw new UnprocessableEntityException([
              {
                message: 'Mã OTP không hợp lệ',
                path: 'code',
              },
            ])
          } else if (body.code) {
            await this.validateVerificationCode({
              email: user.email,
              code: body.code,
              type: TypeOfVerificationCode.LOGIN,
            })
          }
        }
      }
      const device = await this.authRepository.createDevice({
        userId: user.id,
        userAgent: body.userAgent,
        ip: body.ip,
      })
      const tokens = await this.generateTokens({
        userId: user.id,
        deviceId: device.id,
        roleId: user.roleId,
        roleName: user.role.name,
      })
      return tokens
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException('Đăng Nhập Thất Bại!', error)
      }
    }
  }

  async generateTokens({ userId, deviceId, roleId, roleName }: IAccessTokenPayload) {
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.signAccessToken({ userId, deviceId, roleId, roleName }),
      this.tokenService.signRefreshToken({ userId }),
    ])
    //
    const decodedRefreshToken = await this.tokenService.verifyRefreshToken(refreshToken)
    await this.authRepository.createRefreshToken({
      token: refreshToken,
      userId,
      expiresAt: new Date(decodedRefreshToken.exp * 1000),
      deviceId,
    })
    return { accessToken, refreshToken }
  }
  async refreshToken({ refreshToken, userAgent, ip }: RefreshTokenBodyType & { userAgent: string; ip: string }) {
    try {
      //1 check token hợp lệ
      const { userId } = await this.tokenService.verifyRefreshToken(refreshToken)
      //2 check refreshtoken exist
      const tokenInDB = await this.authRepository.findUniqueRefreshTokenIncludeUserRole({
        token: refreshToken,
      })
      if (!tokenInDB) {
        throw new UnauthorizedException('Refresh Token đã sử dụng')
      }
      const {
        deviceId,
        user: {
          roleId,
          role: { name: roleName },
        },
      } = tokenInDB
      //3. Cập nhập device
      const $updateDevice = this.authRepository.updateDevice(deviceId, {
        userAgent,
        ip,
      })
      //4. xóa token cũ
      const $deleteToken = this.authRepository.deleteRefreshToken({ token: refreshToken })
      //5. tạo cặp token mới
      const $tokens = this.generateTokens({ userId, deviceId, roleId, roleName })
      const [, , tokens] = await Promise.all([$updateDevice, $deleteToken, $tokens])
      return tokens
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new UnprocessableEntityException()
    }
  }

  async logout(refreshToken: string) {
    try {
      //1. verify refreshtoken
      await this.tokenService.verifyRefreshToken(refreshToken)

      //2. delete token
      const deleteToken = await this.authRepository.deleteRefreshToken({ token: refreshToken })

      //3. cập nhập device
      await this.authRepository.updateDevice(deleteToken.deviceId, {
        isActive: false,
      })
      return {
        message: 'Đăng Xuất Thành Công',
      }
    } catch (error) {
      if (error instanceof Error)
        throw new UnauthorizedException({
          message: 'Refresh Token Đã Được sử dụng',
        })
    }
  }
  async forgotPassword(body: ForgotPasswordBodyType) {
    const { email, code, newPassword } = body
    //1: check email exists
    const user = await this.shareUserRepository.findUnique({ email })
    if (!user) {
      throw new UnprocessableEntityException([
        {
          message: 'Email Không Tồn Tại',
          path: 'email',
        },
      ])
    }
    //2: kiểm tra mã otp hợp lệ
    await this.validateVerificationCode({
      email,
      code,
      type: TypeOfVerificationCode.FORGOT_PASSWORD,
    })
    //3: cập nhập và xóa đi otp
    const hashedPassword = await this.hashingService.hash(newPassword)

    //việc update and delete không phụ thuộc nhau => promise all
    await Promise.all([
      this.authRepository.updateUser({ id: user.id }, { password: hashedPassword }),
      this.verificationCodeRepository.deleteVerificationCode({
        email_code_type: {
          email: body.email,
          code: body.code,
          type: TypeOfVerificationCode.FORGOT_PASSWORD,
        },
      }),
    ])
    return {
      message: 'Đổi Mật Khẩu Thành Công',
    }
  }
  async twoFactorAuth(userid: number) {
    //1: lấy user xem đã có 2fa chưa
    const user = await this.shareUserRepository.findUnique({ id: userid })
    if (!user) {
      throw new UnprocessableEntityException([
        {
          message: 'User Không Tồn Tại',
          path: 'id',
        },
      ])
    }
    if (user.totpSecret) {
      throw new UnprocessableEntityException([
        {
          message: 'User Đã Bật 2FA',
          path: 'id',
        },
      ])
    }
    //2: tạo secret và uri
    const { secret, uri } = this.twoFactorAuthService.generateSecret(user.email)
    //3: cập nhập secret và user trong db
    await this.authRepository.updateUser({ id: user.id }, { totpSecret: secret })
    //4: trả về secret và uri
    return { secret, uri }
  }
  async disableTwoFactorAuth(data: DisableTwoFactorBodyType & { userId: number }) {
    const { userId, code, totpCode } = data
    const user = await this.shareUserRepository.findUnique({ id: userId })
    if (!user) {
      throw new UnprocessableEntityException([
        {
          message: 'User Không Tồn Tại',
          path: 'id',
        },
      ])
    }
    if (!user.totpSecret) {
      throw new UnprocessableEntityException([
        {
          message: 'User Chưa Bật 2FA',
          path: 'id',
        },
      ])
    }
    //kiem tra ma totp co hop le khong
    if (totpCode) {
      const isValid = this.twoFactorAuthService.verifyToken({
        email: user.email,
        secret: user.totpSecret,
        token: totpCode,
      })
      if (!isValid) {
        throw new UnprocessableEntityException([
          {
            message: 'Mã TOTP Không Hợp Lệ',
            path: 'totpCode',
          },
        ])
      }
    } else if (code) {
      // kiểm tra code hợp lệ
      await this.validateVerificationCode({
        email: user.email,
        code,
        type: TypeOfVerificationCode.DISABLE_2FA,
      })
    }
    // 4:cập nhập secret thành null
    await this.authRepository.updateUser({ id: user.id }, { totpSecret: null })
    return {
      message: 'Disable 2FA Thành Công',
    }
  }
}
