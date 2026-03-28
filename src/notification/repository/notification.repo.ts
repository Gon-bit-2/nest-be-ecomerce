import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/service/prisma.service'
import { CreateNotificationInternalType } from '../notification.model'

@Injectable()
export class NotificationRepo {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: CreateNotificationInternalType) {
    return await this.prismaService.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        body: data.body,
        type: data.type,
        data: data.data || null,
      },
    })
  }

  async findAll({ userId, page, limit, isRead }: { userId: number; page: number; limit: number; isRead?: boolean }) {
    const whereCondition = {
      userId,
      deletedAt: null,
      ...(isRead !== undefined ? { isRead } : {}),
    }
    const skip = (page - 1) * limit
    const take = limit
    const [notifications, totalItems] = await Promise.all([
      this.prismaService.notification.findMany({
        where: whereCondition,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prismaService.notification.count({ where: whereCondition }),
    ])

    return { data: notifications, totalItems }
  }

  async markAsRead(id: number, userId: number) {
    return await this.prismaService.notification.update({
      where: {
        id,
        userId, // ensure a user only marks their own notifications
      },
      data: {
        isRead: true,
      },
    })
  }

  async markAllAsRead(userId: number) {
    return await this.prismaService.notification.updateMany({
      where: {
        userId,
        isRead: false,
        deletedAt: null,
      },
      data: {
        isRead: true,
      },
    })
  }
}
