import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { Request } from 'express'
import envConfig from 'src/shared/config'
import { TokenService } from 'src/shared/service/token.service'

@Injectable()
export class PaymentApiKeyGuard implements CanActivate {
  constructor(private readonly tokenService: TokenService) {}
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>()
    const paymentApiKey = request.headers['x-api-key']

    if (paymentApiKey !== envConfig.API_KEY_SECRET) {
      return false
    }

    return true
  }
}
