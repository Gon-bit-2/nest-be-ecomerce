import { createZodDto } from 'nestjs-zod'
import {
  CreateMessageBodySchema,
  GetConversationQuerySchema,
  GetMessageParamsSchema,
  GetMessageQuerySchema,
} from '../model/message.model'

export class CreateMessageDTO extends createZodDto(CreateMessageBodySchema) {}
export class GetConversationQueryDTO extends createZodDto(GetConversationQuerySchema) {}
export class GetMessageParamsDTO extends createZodDto(GetMessageParamsSchema) {}
export class GetMessageQueryDTO extends createZodDto(GetMessageQuerySchema) {}
