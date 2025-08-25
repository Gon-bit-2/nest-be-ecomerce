import { UserStatus } from '@prisma/client'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
//Serializer
const UserSchema = z.object({
  id: z.number(),
  email: z.string(),
  name: z.string(),
  phoneNumber: z.string(),
  avatar: z.string().nullable(),
  status: z.enum([UserStatus.ACTIVE, UserStatus.INACTIVE, UserStatus.BLOCKED]),
  roleId: z.number(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deleteAt: z.date().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
const RegisterBodySchema = z
  .object({
    email: z.string().email().nonempty(),
    password: z.string().min(6).max(100).nonempty(),
    name: z.string().min(1).max(100).nonempty(),
    confirmPassword: z.string().min(6).max(100).nonempty(),
    phoneNumber: z.string().min(10).max(15).nonempty(),
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
export class RegisterBodyDTO extends createZodDto(RegisterBodySchema) {}
export class RegisterResDTO extends createZodDto(UserSchema) {}
