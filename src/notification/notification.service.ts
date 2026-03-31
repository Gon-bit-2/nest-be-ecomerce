import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { NotificationRepo } from './repository/notification.repo'
import { NotificationGateway } from 'websockets/notification.gateway'
import type { CreateNotificationInternalType } from './notification.model'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { NotFoundRecordException } from 'src/shared/error/error'
import { EmailService } from 'src/shared/service/email.service'
import { ShareUserRepository } from 'src/shared/repositories/shared-user.repo'

@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationRepo: NotificationRepo,
    private readonly notificationGateway: NotificationGateway,
    private readonly shareUserRepo: ShareUserRepository,
    private readonly emailService: EmailService,
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

  @OnEvent('payment.success')
  async handlePaymentSuccess(data: { userId: number; orderCode: string | null; amount: number }) {
    try {
      // 1. Lấy thông tin user
      const user = await this.shareUserRepo.findUnique({ id: data.userId })
      if (!user) return

      const notificationTitle = 'Thanh toán thành công'
      const notificationBody = `Đơn hàng ${data.orderCode ? '#' + data.orderCode : 'của bạn'} đã được thanh toán thành công số tiền ${data.amount.toLocaleString('vi-VN')} VND.`

      // 2. Gửi in-app notification (hoặc Push notification nếu client hỗ trợ FCM sẽ config ở đây)
      await this.handleNotificationSendEvent({
        userId: data.userId,
        title: notificationTitle,
        body: notificationBody,
        type: 'ORDER',
      })

      // 3. Gửi email
      if (user.email) {
        await this.emailService.sendPaymentSuccessEmail({
          email: user.email,
          orderCode: data.orderCode || 'N/A',
          amount: data.amount,
        })
      }
    } catch (error) {
      console.error('Lỗi khi xử lý payment.success notification', error)
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
