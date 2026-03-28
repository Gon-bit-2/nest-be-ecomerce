import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Server } from 'socket.io'
import { generateRoomUserId } from 'src/shared/helpers'

// We can run this gateway on the root namespace, or a specific /notification namespace
@WebSocketGateway({
  namespace: '/',
})
export class NotificationGateway {
  @WebSocketServer()
  server: Server

  sendNotificationToUser(userId: number, payload: any) {
    this.server.to(generateRoomUserId(userId)).emit('new-notification', payload)
  }
}
