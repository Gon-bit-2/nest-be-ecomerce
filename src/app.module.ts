/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { SharedModule } from 'src/shared/shared.module'
import { AuthModule } from './auth/auth.module'
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core'
import { ZodSerializerInterceptor } from 'nestjs-zod'
import CustomZodValidationPipe from 'src/pipes/custom-zod-validation.pipe'
import { HttpExceptionFilter } from 'src/filter/http-exception.filter'
import { AuthenticationGuard } from 'src/shared/guard/authentication.guard'
import { LanguageModule } from './language/language.module'
import { PermissionModule } from './permission/permission.module'
import { RoleModule } from './role/role.module'
import { ProfileModule } from './profile/profile.module'
import { UserModule } from './user/user.module'
import { MediaModule } from './media/media.module'
import { BrandModule } from './brand/brand.module'
import { BrandTranslationModule } from 'src/brand/brand-translation/brand-translation.module'
import * as path from 'path'
import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n'
import { CategoryModule } from './category/category.module'
import { ProductModule } from './product/product.module'
import { OrderModule } from './order/order.module'
import { CartModule } from './cart/cart.module'
import { PaymentModule } from './payment/payment.module'
import { BullModule } from '@nestjs/bullmq'
import envConfig from './shared/config'
import { PaymentConsumer } from './queues/payment.consumer'
import { WebsocketModule } from 'websockets/webscoket.module'
import { ThrottlerModule } from '@nestjs/throttler'
import { ThrottlerBehindProxyGuard } from './shared/guard/throttler-behind-proxy.guard'
import { ReviewModule } from './review/review.module'
import { ScheduleModule } from '@nestjs/schedule'
import { CacheModule } from '@nestjs/cache-manager'
import { createKeyv } from '@keyv/redis'
import { DiscountModule } from './discount/discount.module'
import { ShopVideoModule } from './shop-video/shop-video.module'
import { LoggerModule } from 'nestjs-pino'
import { MessageModule } from './message/message.module'
import { AddressModule } from './address/address.module'
import { ShopModule } from './shop/shop.module';
import pino from 'pino'
import pretty from 'pino-pretty'
@Module({
  imports: [
    SharedModule,
    AuthModule,
    LanguageModule,
    PermissionModule,
    RoleModule,
    ProfileModule,
    UserModule,
    MediaModule,
    BrandModule,
    BrandTranslationModule,
    CategoryModule,
    ProductModule,
    OrderModule,
    CartModule,
    PaymentModule,
    WebsocketModule,
    ReviewModule,
    DiscountModule,
    ShopVideoModule,
    AddressModule,
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.resolve('src/i18n/'),
        watch: true,
      },
      resolvers: [{ use: QueryResolver, options: ['lang'] }, AcceptLanguageResolver],
      typesOutputPath: path.resolve('src/generated/i18n.generated.ts'),
    }),
    BullModule.forRoot({
      connection: {
        /*local
        host: 'localhost',
        port: 6379,
        */
        //
        host: envConfig.REDIS_HOST,
        port: envConfig.REDIS_PORT,
        username: envConfig.REDIS_USERNAME,
        password: envConfig.REDIS_PASSWORD,
        maxRetriesPerRequest: null, // Bắt buộc: để BullMQ tự xử lý retry thay vì Redis client
      },
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 100,
        },
      ],
    }),
    ScheduleModule.forRoot(),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: () => {
        return {
          stores: [
            createKeyv(
              `redis://${envConfig.REDIS_USERNAME}:${envConfig.REDIS_PASSWORD}@redis-12766.crce194.ap-seast-1-1.ec2.cloud.redislabs.com:${envConfig.REDIS_PORT}`,
            ),
          ],
        }
      },
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        serializers: {
          req: (req: any) => {
            return {
              method: req.method,
              url: req.url,
              query: req.query,
              params: req.params,
            }
          },
          res: (res: any) => {
            return {
              statusCode: res.statusCode,
            }
          },
        },
        stream: pino.multistream([
          {
            stream: pretty({
              colorize: true,
              translateTime: 'SYS:standard',
              ignore: 'pid,hostname',
              singleLine: false,
            }),
          },
          {
            stream: pino.destination({
              dest: path.resolve('logs/app.log'),
              sync: false,
              mkdir: true,
            }),
          },
        ]),
      },
    }),
    MessageModule,
    ShopModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },

    {
      provide: APP_GUARD,
      useClass: ThrottlerBehindProxyGuard,
    },
    {
      provide: APP_PIPE,
      useClass: CustomZodValidationPipe,
    },
    { provide: APP_INTERCEPTOR, useClass: ZodSerializerInterceptor },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    PaymentConsumer,
  ],
})
export class AppModule {}
