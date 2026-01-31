import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { NestExpressApplication } from '@nestjs/platform-express'
import { WebsocketAdapter } from 'websockets/websocket.adapter'
// import { UPLOAD_DIR } from 'src/shared/constants/other.constant'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { cleanupOpenApiDoc } from 'nestjs-zod'
import helmet from 'helmet'
import { Logger } from 'nestjs-pino'
// import { LoggingInterceptor } from './shared/interceptor/logging.interceptor'
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bufferLogs: true })
  app.use(helmet())
  app.enableCors()
  app.useLogger(app.get(Logger))
  // app.useGlobalInterceptors(new LoggingInterceptor())
  const websocketAdapter = new WebsocketAdapter(app)
  await websocketAdapter.connectToRedis()
  app.useWebSocketAdapter(websocketAdapter)
  app.set('trust proxy', 'loopback')
  const config = new DocumentBuilder()
    .setTitle('Ecomerce API Documentation')
    .setDescription('API documentation for Ecomerce application')
    .setVersion('1.0')
    .addBearerAuth()
    .addApiKey(
      {
        name: 'authorization',
        type: 'apiKey',
        in: 'header',
      },
      'payment-api-key',
    )
    .build()
  const documentFactory = () => cleanupOpenApiDoc(SwaggerModule.createDocument(app, config))
  SwaggerModule.setup('api', app, documentFactory, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  })
  await app.listen(process.env.PORT ?? 9999)
}
void bootstrap()
