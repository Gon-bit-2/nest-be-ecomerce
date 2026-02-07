import { Module } from '@nestjs/common'
import { MessageService } from './message.service'
import { MessageController } from './message.controller'
import { MessageRepository } from './repository/message.repository'
import { MessageGateway } from './gateway/message.gateway'

@Module({
  controllers: [MessageController],
  providers: [MessageService, MessageRepository, MessageGateway],
  exports: [MessageService],
})
export class MessageModule {}
