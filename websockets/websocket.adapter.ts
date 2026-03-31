import { INestApplicationContext } from '@nestjs/common'
import { IoAdapter } from '@nestjs/platform-socket.io'
import { ServerOptions, Server, Socket } from 'socket.io'
import { generateRoomUserId } from 'src/shared/helpers'
import { SharedWebsocketRepository } from 'src/shared/repositories/shared-websocket.repo'
import { TokenService } from 'src/shared/service/token.service'
import { createAdapter } from '@socket.io/redis-adapter'
import { createClient } from 'redis'
import envConfig from 'src/shared/config'
export class WebsocketAdapter extends IoAdapter {
  private readonly sharedWebsocketRepository: SharedWebsocketRepository
  private readonly tokenService: TokenService
  private adapterConstructor: ReturnType<typeof createAdapter>
  constructor(app: INestApplicationContext) {
    super(app)
    this.sharedWebsocketRepository = app.get(SharedWebsocketRepository)
    this.tokenService = app.get(TokenService)
  }
  async connectToRedis(): Promise<void> {
    const pubClient = createClient({
      username: envConfig.REDIS_USERNAME,
      password: envConfig.REDIS_PASSWORD,

      socket: {
        host: envConfig.REDIS_HOST,
        port: envConfig.REDIS_PORT,
      },
    })
    const subClient = pubClient.duplicate()

    await Promise.all([pubClient.connect(), subClient.connect()])

    this.adapterConstructor = createAdapter(pubClient, subClient)
  }

  createIOServer(port: number, options?: ServerOptions) {
    const server: Server = super.createIOServer(port, {
      ...options,
      cors: {
        origin: '*',
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    })
    if (this.adapterConstructor) {
      server.adapter(this.adapterConstructor)
    }

    server.of('/').use((socket, next) => {
      this.authMiddleware(socket, next)
    })
    server.of(/.*/).use((socket, next) => {
      this.authMiddleware(socket, next)
    }) // áp dụng global trừ main
    return server
  }
  async authMiddleware(socket: Socket, next: (err?: any) => void) {
    const authorization =
      socket.handshake.headers.authorization ||
      (socket.handshake.auth?.token as string) ||
      (socket.handshake.query?.token as string)
    if (!authorization) {
      console.error(`Socket auth failed: Missing authorization headers for socket ${socket.id}`)
      return next(new Error('Missing authorization headers'))
    }
    const accessToken = authorization.startsWith('Bearer ') ? authorization.split(' ')[1] : authorization
    if (!accessToken) {
      console.error(`Socket auth failed: Missing access token for socket ${socket.id}`)
      return next(new Error('Missing access token'))
    }
    try {
      const { userId } = await this.tokenService.verifyAccessToken(accessToken)
      await socket.join(generateRoomUserId(userId))
      console.log(`Socket ${socket.id} joined room ${generateRoomUserId(userId)} on namespace ${socket.nsp.name}`)
      next()
    } catch (error) {
      console.error(`Socket auth failed: Token verification error for socket ${socket.id}`, error)
      return next(error)
    }
  }
}
