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
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.resolve('src/i18n/'),
        watch: true,
      },
      resolvers: [{ use: QueryResolver, options: ['lang'] }, AcceptLanguageResolver],
      typesOutputPath: path.resolve('src/generated/i18n.generated.ts'),
    }),
    CategoryModule,
    ProductModule,
    OrderModule,
    CartModule,
    PaymentModule,
    BullModule.forRoot({
      connection: {
        /*local
        host: 'localhost',
        port: 6379,
        */
        //
        host: 'redis-13584.c292.ap-southeast-1-1.ec2.cloud.redislabs.com',
        port: 13584,
        username: envConfig.REDIS_USERNAME,
        password: envConfig.REDIS_PASSWORD,
      },
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
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
