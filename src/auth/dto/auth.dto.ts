import { createZodDto } from 'nestjs-zod'
import { RegisterBodySchema, RegisterResSchema } from 'src/auth/auth.model'
//Serializer

export class RegisterBodyDTO extends createZodDto(RegisterBodySchema) {}
export class RegisterResDTO extends createZodDto(RegisterResSchema) {}
