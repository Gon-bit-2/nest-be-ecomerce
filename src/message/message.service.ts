import { Injectable, BadRequestException } from '@nestjs/common'
import { CreateMessageBodyType } from './model/message.model'
import { MessageRepository } from './repository/message.repository'
import { MessageGateway } from './gateway/message.gateway'

@Injectable()
export class MessageService {
  constructor(
    private readonly messageRepo: MessageRepository,
    private readonly messageGateway: MessageGateway,
  ) {}

  async sendMessage(senderId: number, dto: CreateMessageBodyType) {
    const { receiverId, content } = dto

    if (senderId === receiverId) {
      throw new BadRequestException('Cannot send message to yourself')
    }

    const message = await this.messageRepo.sendMessage(senderId, receiverId, content)

    // Emit socket event to receiver
    this.messageGateway.sendToUser(receiverId, 'new_message', message)
    // Emit socket event to sender (optional, for syncing multiple devices)
    this.messageGateway.sendToUser(senderId, 'new_message', message)

    return message
  }

  async getConversations(userId: number) {
    return this.messageRepo.getUserConversations(userId)
  }

  async getMessages(userId: number, conversationId: number) {
    return this.messageRepo.getConversationMessages(conversationId, userId)
  }
}
