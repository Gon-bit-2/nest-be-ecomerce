import { TypeOfVerificationCode } from 'src/shared/constants/auth.constant'
import { UserSchema } from 'src/shared/model/shared-user.model'
import z from 'zod'

export const RegisterBodySchema = UserSchema.pick({
  email: true,
  password: true,
  name: true,
  phoneNumber: true,
})
  .extend({
    confirmPassword: z.string().min(6).max(100).nonempty(),
    code: z.string().length(6),
  })
  .strict()
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: 'custom',
        message: 'Password anh Confirm Password must match',
        path: ['confirmPassword'],
      })
    }
  })
export type RegisterBodyType = z.infer<typeof RegisterBodySchema>
//
export const RegisterResSchema = UserSchema.omit({
  password: true,
  totpSecret: true,
})
export type RegisterResType = z.infer<typeof RegisterResSchema>

//
export const VerificationCode = z.object({
  id: z.number(),
  email: z.string().email(),
  code: z.string().length(6),
  type: z.enum([
    TypeOfVerificationCode.REGISTER,
    TypeOfVerificationCode.FORGOT_PASSWORD,
    TypeOfVerificationCode.LOGIN,
    TypeOfVerificationCode.DISABLE_2FA,
  ]),
  expiresAt: z.date(),
  createdAt: z.date(),
})
export type VerificationCodeType = z.infer<typeof VerificationCode>
//
export const SendOTPBodySchema = VerificationCode.pick({
  email: true,
  type: true,
}).strict()

export type SendOTPBodyType = z.infer<typeof SendOTPBodySchema>

export const VerifyOTPBodySchema = VerificationCode.pick({
  email: true,
  code: true,
  type: true,
}).strict()
export type VerifyOTPBodyType = z.infer<typeof VerifyOTPBodySchema>

//tắt 2fa
export const DisableTwoFactorBodySchema = z
  .object({
    totpCode: z.string().length(6).optional(),
    code: z.string().length(6).optional(),
  })
  .strict()
  .superRefine(({ totpCode, code }, ctx) => {
    const message = 'Bạn cần cung cấp mã xác thực 2FA hoặc OTP. Không cung cấp cả hai'
    if ((totpCode !== undefined) === (code !== undefined)) {
      ctx.addIssue({
        code: 'custom',
        message,
        path: ['totpCode'],
      })
      ctx.addIssue({
        code: 'custom',
        message,
        path: ['code'],
      })
    }
  })
export type DisableTwoFactorBodyType = z.infer<typeof DisableTwoFactorBodySchema>
export const TwoFactorSetupResSchema = z.object({
  secret: z.string(),
  url: z.string().url(),
})
export type TwoFactorSetupResType = z.infer<typeof TwoFactorSetupResSchema>
// login
export const LoginBodySchema = UserSchema.pick({
  email: true,
  password: true,
})
  .extend({
    totpCode: z.string().length(6).optional(), //2fa
    code: z.string().length(6).optional(), //otp code email
  })
  .strict()
  .superRefine(({ totpCode, code }, ctx) => {
    //khi nguoi dung truyen ca 2 len thi khong cho qua
    if (totpCode !== undefined && code !== undefined) {
      ctx.addIssue({
        code: 'custom',
        message: 'Bạn chỉ cần cung cấp mã xác thực 2FA hoặc OTP. Không cung cấp cả hai',
        path: ['totpCode'],
      })
      ctx.addIssue({
        code: 'custom',
        message: 'Bạn chỉ cần cung cấp mã xác thực 2FA hoặc OTP. Không cung cấp cả hai',
        path: ['code'],
      })
    }
  })
export type LoginBodyType = z.infer<typeof LoginBodySchema>

export const LoginResSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
})
export type LoginResType = z.infer<typeof LoginResSchema>
//refresh token
export const RefreshTokenSchema = z.object({
  token: z.string(),
  userId: z.number(),
  deviceId: z.number(),
  expiresAt: z.date(),
  createdAt: z.date(),
})
export type RefreshTokenType = z.infer<typeof RefreshTokenSchema>
export const RefreshTokenBodySchema = z
  .object({
    refreshToken: z.string(),
  })
  .strict()
export type RefreshTokenBodyType = z.infer<typeof RefreshTokenBodySchema>

export const RefreshTokenResSchema = LoginResSchema
export type RefreshTokenResType = LoginResType
//Device
export const DeviceSchema = z.object({
  id: z.number(),
  userId: z.number(),
  userAgent: z.string(),
  ip: z.string(),
  lastActive: z.date(),
  createdAt: z.date(),
  isActive: z.boolean().optional(),
})
export type DeviceType = z.infer<typeof DeviceSchema>

//role
export const RoleSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  isActive: z.boolean(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
//logout
export const LogoutBodySchema = RefreshTokenBodySchema
export type LogoutBodyType = RefreshTokenBodyType
//oauth2
export const GoogleAuthStateSchema = DeviceSchema.pick({
  userAgent: true,
  ip: true,
})
export type GoogleAuthStateType = z.infer<typeof GoogleAuthStateSchema>

export const GetAuthorizationUrlResSchema = z.object({
  url: z.string().url(),
})
export type GetAuthorizationUrlResType = z.infer<typeof GetAuthorizationUrlResSchema>

//forgot password
export const ForgotPasswordBodySchema = z
  .object({
    email: z.string().email(),
    code: z.string().length(6),
    newPassword: z.string().min(6).max(100).nonempty(),
    confirmNewPassword: z.string().min(6).max(100).nonempty(),
  })
  .strict()
  .superRefine(({ confirmNewPassword, newPassword }, ctx) => {
    if (confirmNewPassword !== newPassword) {
      ctx.addIssue({
        code: 'custom',
        message: 'Mật khẩu không khớp',
        path: ['confirmNewPassword'],
      })
    }
  })
export type ForgotPasswordBodyType = z.infer<typeof ForgotPasswordBodySchema>
