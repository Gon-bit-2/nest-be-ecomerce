import { createZodDto } from 'nestjs-zod'
import { PaymentConfigResSchema, PaymentStatusResSchema, WebhookPaymentBodySchema } from '../model/payment.model'

export class WebhookPaymentBodyDTO extends createZodDto(WebhookPaymentBodySchema) {}

export class PaymentConfigResDTO extends createZodDto(PaymentConfigResSchema) {}

export class PaymentStatusResDTO extends createZodDto(PaymentStatusResSchema) {}
