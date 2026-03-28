import { Module } from '@nestjs/common'
import { NotificationService } from './notification.service'
import { NotificationController } from './notification.controller'
import { NotificationRepo } from './repository/notification.repo'
import { WebsocketModule } from 'websockets/webscoket.module'
import { SharedModule } from 'src/shared/shared.module'

@Module({
  imports: [WebsocketModule, SharedModule],
  providers: [NotificationService, NotificationRepo],
  controllers: [NotificationController],
})
export class NotificationModule {}
