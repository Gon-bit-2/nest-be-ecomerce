import { Controller, Get, Post, Body, Param } from '@nestjs/common'
import { MessageService } from './message.service'
import { CreateMessageDTO, GetMessageParamsDTO } from './dto/message.dto'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'

@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  sendMessage(@ActiveUser('userId') userId: number, @Body() body: CreateMessageDTO) {
    return this.messageService.sendMessage(userId, body)
  }

  @Get('conversations')
  getConversations(@ActiveUser('userId') userId: number) {
    return this.messageService.getConversations(userId)
  }

  @Get('conversations/:conversationId')
  getMessages(@ActiveUser('userId') userId: number, @Param() params: GetMessageParamsDTO) {
    return this.messageService.getMessages(userId, params.conversationId)
  }
}
