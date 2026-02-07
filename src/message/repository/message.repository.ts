import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/service/prisma.service'

@Injectable()
export class MessageRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findConversation(userAId: number, userBId: number) {
    // Ensure consistent order based on schema comment: userAId < userBId
    const user1 = userAId < userBId ? userAId : userBId
    const user2 = userAId < userBId ? userBId : userAId

    return await this.prismaService.conversation.findUnique({
      where: {
        userAId_userBId: { userAId: user1, userBId: user2 },
      },
    })
  }

  async findConversationByIdAndUserId(conversationId: number, userId: number) {
    return await this.prismaService.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [{ userAId: userId }, { userBId: userId }],
      },
    })
  }

  async createConversation(userAId: number, userBId: number) {
    // Ensure consistent order based on schema comment: userAId < userBId
    const user1 = userAId < userBId ? userAId : userBId
    const user2 = userAId < userBId ? userBId : userAId

    return await this.prismaService.conversation.create({
      data: { userAId: user1, userBId: user2 },
    })
  }

  async sendMessage(senderId: number, receiverId: number, content: string) {
    // 1. Tìm hoặc tạo Conversation
    let conversation = await this.findConversation(senderId, receiverId)

    if (!conversation) {
      conversation = await this.createConversation(senderId, receiverId)
    }

    // 2. Tạo Message và Update Conversation trong 1 Transaction
    return await this.prismaService.$transaction(async (tx) => {
      const message = await tx.message.create({
        data: {
          conversationId: conversation.id,
          fromUserId: senderId,
          toUserId: receiverId,
          content,
        },
        include: { fromUser: true, toUser: true },
      })

      await tx.conversation.update({
        where: { id: conversation.id },
        data: {
          updatedAt: new Date(),
          lastMessageId: message.id,
        },
      })

      return message
    })
  }

  async getUserConversations(userId: number) {
    return await this.prismaService.conversation.findMany({
      where: {
        OR: [{ userAId: userId }, { userBId: userId }],
      },
      include: {
        userA: true,
        userB: true,
        lastMessage: true,
      },
      orderBy: { updatedAt: 'desc' },
    })
  }

  async getConversationMessages(conversationId: number, userId: number) {
    // Check quyền: User phải là thành viên của conversation
    const conversation = await this.findConversationByIdAndUserId(conversationId, userId)

    if (!conversation) return []

    return await this.prismaService.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      include: { fromUser: true },
    })
  }
}
