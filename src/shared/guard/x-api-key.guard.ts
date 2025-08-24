import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import envConfig from 'src/shared/config'
import { TokenService } from 'src/shared/service/token.service'

@Injectable()
export class XApiKeyGuard implements CanActivate {
  constructor(private readonly tokenService: TokenService) {}
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()
    const xApiKey = request.headers['x-api-key']

    if (xApiKey !== envConfig.API_KEY_SECRET) {
      return false
    }

    return true
  }
}
