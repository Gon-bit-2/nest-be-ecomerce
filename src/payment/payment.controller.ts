import { Body, Controller, Post } from '@nestjs/common'
import { PaymentService } from './payment.service'
import { isPublic } from 'src/shared/decorators/auth.decorator'
import { WebhookPaymentBodyDTO } from './dto/payment.dto'
import { ZodSerializerDto } from 'nestjs-zod'
import { MessageResDTO } from 'src/shared/dtos/response.dto'

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('receiver')
  @isPublic()
  @ZodSerializerDto(MessageResDTO)
  async receiver(@Body() body: WebhookPaymentBodyDTO) {
    return this.paymentService.receiver(body)
  }
}
