import { UserStatus } from 'src/shared/constants/auth.constant'
import z from 'zod'

export const UserSchema = z.object({
  id: z.number(),
  email: z.string().email().nonempty(),
  password: z.string().min(6).max(100).nonempty(),
  name: z.string().min(1).max(100).nonempty(),
  phoneNumber: z.string().min(10).max(15).nonempty(),
  avatar: z.string().nullable(),
  totpSecret: z.string().nullable(),
  status: z.enum([UserStatus.ACTIVE, UserStatus.INACTIVE, UserStatus.BLOCKED]),
  roleId: z.number().positive(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deleteAt: z.date().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
export type UserType = z.infer<typeof UserSchema>
export const RegisterBodySchema = UserSchema.pick({
  email: true,
  password: true,
  name: true,
  phoneNumber: true,
})
  .extend({
    confirmPassword: z.string().min(6).max(100).nonempty(),
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

export const RegisterResSchema = UserSchema.omit({
  password: true,
  totpSecret: true,
})
export type RegisterResType = z.infer<typeof RegisterResSchema>
