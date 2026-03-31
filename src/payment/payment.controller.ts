import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common'
import { PaymentService } from './payment.service'
import { Auth, isPublic } from 'src/shared/decorators/auth.decorator'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { PaymentConfigResDTO, PaymentStatusResDTO, WebhookPaymentBodyDTO } from './dto/payment.dto'
import { ZodSerializerDto } from 'nestjs-zod'
import { MessageResDTO } from 'src/shared/dtos/response.dto'
import { ApiSecurity } from '@nestjs/swagger'

@Controller('payment')
@ApiSecurity('payment-api-key')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get('config')
  @isPublic()
  @ZodSerializerDto(PaymentConfigResDTO)
  getConfig() {
    return this.paymentService.getConfig()
  }

  @Get(':paymentId/status')
  @ZodSerializerDto(PaymentStatusResDTO)
  getPaymentStatus(@Param('paymentId', ParseIntPipe) paymentId: number, @ActiveUser('userId') userId: number) {
    return this.paymentService.getPaymentStatus(paymentId, userId)
  }

  @Post('receiver')
  @isPublic()
  @Auth('ApiKey')
  @ZodSerializerDto(MessageResDTO)
  async receiver(@Body() body: WebhookPaymentBodyDTO) {
    return this.paymentService.receiver(body)
  }
}
