import z from 'zod'

export const NotificationSchema = z
  .object({
    id: z.number(),
    userId: z.number(),
    title: z.string(),
    body: z.string(),
    type: z.string(),
    data: z.any().nullable(),
    isRead: z.boolean(),
    createdAt: z.date(),
  })
  .passthrough()

export const GetAllNotificationsResSchema = z.object({
  data: z.array(NotificationSchema),
  totalItems: z.number(),
})

export const GetAllNotificationsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
  isRead: z.coerce.boolean().optional(),
})

export const GetNotificationParamsSchema = z
  .object({
    notificationId: z.coerce.number().int().positive(),
  })
  .strict()

export const CreateNotificationInternalSchema = z.object({
  userId: z.number(),
  title: z.string(),
  body: z.string(),
  type: z.string().default('SYSTEM'),
  data: z.any().optional(),
})

export type NotificationType = z.infer<typeof NotificationSchema>
export type CreateNotificationInternalType = z.infer<typeof CreateNotificationInternalSchema>
