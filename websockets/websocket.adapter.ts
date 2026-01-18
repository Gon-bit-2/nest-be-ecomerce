import { IoAdapter } from '@nestjs/platform-socket.io'
import { ServerOptions, Server, Socket } from 'socket.io'

export class WebsocketAdapter extends IoAdapter {
  createIOServer(port: number, options?: ServerOptions) {
    const server: Server = super.createIOServer(port, {
      ...options,
      cors: {
        origin: '*',
        credentials: true,
      },
    })
    const authMiddleware = (socket: Socket, next: (err?: any) => void) => {
      socket.on('disconnect', () => {
        console.log(`client disconnect:${socket.id}`)
      })
      next()
    }
    server.of('/').use(authMiddleware)
    server.of(/.*/).use(authMiddleware)
    return server
  }
}
