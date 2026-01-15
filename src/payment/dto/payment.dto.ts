import { createZodDto } from 'nestjs-zod'
import { WebhookPaymentBodySchema } from '../model/payment.model'

export class WebhookPaymentBodyDTO extends createZodDto(WebhookPaymentBodySchema) {}
