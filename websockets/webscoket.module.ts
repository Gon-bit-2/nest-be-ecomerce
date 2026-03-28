import { Module } from '@nestjs/common'
import { ChatGateway } from './chat.gateway'
import { PaymentGateway } from './payment.gateway'
import { NotificationGateway } from './notification.gateway'

@Module({
  providers: [ChatGateway, PaymentGateway, NotificationGateway],
  exports: [NotificationGateway],
})
export class WebsocketModule {}
