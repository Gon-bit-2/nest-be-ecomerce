import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { NotificationRepo } from './repository/notification.repo'
import { NotificationGateway } from 'websockets/notification.gateway'
import type { CreateNotificationInternalType } from './notification.model'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { NotFoundRecordException } from 'src/shared/error/error'

@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationRepo: NotificationRepo,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  @OnEvent('notification.send')
  async handleNotificationSendEvent(payload: CreateNotificationInternalType) {
    try {
      // 1. Lưu xuống Database
      const notification = await this.notificationRepo.create(payload)

      // 2. Push qua WebSockets (Realtime)
      this.notificationGateway.sendNotificationToUser(payload.userId, notification)
    } catch (error) {
      console.error('Lỗi khi xử lý notification.send', error)
    }
  }

  async findAll(userId: number, page: number, limit: number, isRead?: boolean) {
    return await this.notificationRepo.findAll({ userId, page, limit, isRead })
  }

  async markAsRead(id: number, userId: number) {
    try {
      return await this.notificationRepo.markAsRead(id, userId)
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw NotFoundRecordException
        }
      }
      throw error
    }
  }

  async markAllAsRead(userId: number) {
    await this.notificationRepo.markAllAsRead(userId)
    return { message: 'All notifications marked as read' }
  }
}
