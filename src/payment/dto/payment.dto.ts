import { createZodDto } from 'nestjs-zod'
import { PaymentConfigResSchema, WebhookPaymentBodySchema } from '../model/payment.model'

export class WebhookPaymentBodyDTO extends createZodDto(WebhookPaymentBodySchema) {}

export class PaymentConfigResDTO extends createZodDto(PaymentConfigResSchema) {}
