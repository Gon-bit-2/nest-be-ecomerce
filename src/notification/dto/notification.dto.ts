import { createZodDto } from 'nestjs-zod'
import {
  GetAllNotificationsQuerySchema,
  GetAllNotificationsResSchema,
  GetNotificationParamsSchema,
  NotificationSchema,
} from '../notification.model'

export class GetAllNotificationsResDTO extends createZodDto(GetAllNotificationsResSchema) {}
export class GetAllNotificationsQueryDTO extends createZodDto(GetAllNotificationsQuerySchema) {}
export class GetNotificationParamsDTO extends createZodDto(GetNotificationParamsSchema) {}
export class NotificationResDTO extends createZodDto(NotificationSchema) {}
