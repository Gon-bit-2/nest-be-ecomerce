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
  ],
})
export class AppModule {}
