import { createZodDto } from 'nestjs-zod'
import { EmptyBodySchema } from '../model/request.model'

export class EmptyBodyDTO extends createZodDto(EmptyBodySchema) {}
