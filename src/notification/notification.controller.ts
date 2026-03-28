import { Controller, Get, Patch, Param, Query } from '@nestjs/common'
import { NotificationService } from './notification.service'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  GetAllNotificationsQueryDTO,
  GetAllNotificationsResDTO,
  GetNotificationParamsDTO,
  NotificationResDTO,
} from './dto/notification.dto'
import { MessageResDTO } from 'src/shared/dtos/response.dto'

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ZodSerializerDto(GetAllNotificationsResDTO)
  findAll(@Query() query: GetAllNotificationsQueryDTO, @ActiveUser('userId') userId: number) {
    return this.notificationService.findAll(userId, query.page, query.limit, query.isRead)
  }

  @Patch('read-all')
  @ZodSerializerDto(MessageResDTO)
  markAllAsRead(@ActiveUser('userId') userId: number) {
    return this.notificationService.markAllAsRead(userId)
  }

  @Patch(':notificationId/read')
  @ZodSerializerDto(NotificationResDTO)
  markAsRead(@Param() params: GetNotificationParamsDTO, @ActiveUser('userId') userId: number) {
    return this.notificationService.markAsRead(params.notificationId, userId)
  }
}
