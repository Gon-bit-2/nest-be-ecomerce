import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { Request } from 'express'
import { TokenService } from 'src/shared/service/token.service'

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(private readonly tokenService: TokenService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>()
    const token = request.headers.authorization?.split(' ')[1] // Assuming Bearer token format}

    if (!token) {
      return false
    }
    try {
      const decodedAccessToken = await this.tokenService.verifyAccessToken(token)
      request.user = decodedAccessToken
      return true
    } catch {
      return false
    }
  }
}
