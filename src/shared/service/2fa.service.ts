import { Injectable } from '@nestjs/common'
import * as OTPAuth from 'otpauth'
@Injectable()
export class TwoFactorAuthService {
  constructor() {}
  private crateTOTP(email: string, secret?: string) {
    return new OTPAuth.TOTP({
      issuer: 'E-commerce',
      label: email,
      algorithm: 'SHA-1',
      digits: 6,
      period: 30,
      secret: secret || new OTPAuth.Secret(),
    })
  }
  generateSecret(email: string) {
    const totp = this.crateTOTP(email)
    return {
      secret: totp.secret.base32,
      uri: totp.toString(),
    }
  }
  verifyToken({ email, token, secret }: { email: string; token: string; secret?: string }): boolean {
    const totp = this.crateTOTP(email, secret)
    const delta = totp.validate({ token, window: 1 })
    return delta !== null
  }
}
//test
const twoFactorAuthService = new TwoFactorAuthService()
console.log(
  twoFactorAuthService.verifyToken({
    email: 'vanthien7027@gmail.com',
    token: '123456',
    secret: 'JBSWY3DPEHPK3PXP',
  }),
)
