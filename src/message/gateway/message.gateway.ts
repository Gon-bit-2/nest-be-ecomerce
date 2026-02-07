import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { TokenService } from 'src/shared/service/token.service'
import { SharedWebsocketRepository } from 'src/shared/repositories/shared-websocket.repo'
import { UnauthorizedException } from '@nestjs/common'

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class MessageGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  constructor(
    private readonly tokenService: TokenService,
    private readonly sharedWebsocketRepo: SharedWebsocketRepository,
  ) {}

  async handleConnection(client: Socket) {
    try {
      // 1. Get token from header or query
      const authHeader = client.handshake.headers.authorization
      const token = authHeader?.split(' ')[1] || (client.handshake.query.token as string)

      if (!token) {
        throw new UnauthorizedException('No token provided')
      }

      // 2. Verify token
      const payload = await this.tokenService.verifyAccessToken(token)
      if (!payload) {
        throw new UnauthorizedException('Invalid token')
      }

      const userId = payload.userId

      // 3. Join room
      await client.join(`user_${userId}`)

      // 4. Save to DB
      await this.sharedWebsocketRepo.create({
        id: client.id,
        userId: userId,
      })

      console.log(`Client connected: ${client.id}, User: ${userId}`)
    } catch (error) {
      console.error(`Connection failed: ${(error as Error).message}`)
      client.disconnect()
    }
  }

  async handleDisconnect(client: Socket) {
    try {
      // Clean up DB
      await this.sharedWebsocketRepo.delete(client.id)
      console.log(`Client disconnected: ${client.id}`)
    } catch (error) {
      console.error(`Disconnect error: ${(error as Error).message}`)
    }
  }

  // Helper to emit to a specific user
  sendToUser(userId: number, event: string, data: any) {
    this.server.to(`user_${userId}`).emit(event, data)
  }
}
