/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common'
import { Request } from 'express'
import { AccessTokenPayload } from 'src/shared/types/jwt.type'
import { TokenService } from 'src/shared/service/token.service'
import { REQUEST_USER_KEY } from '../decorators/custom-validator.decorator'
import { PrismaService } from '../service/prisma.service'
import { HTTPMethod } from '../constants/role.constant'
@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly prismaService: PrismaService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { user?: AccessTokenPayload }>()
    //extract and validate token
    const decodedAccessToken = await this.extractAndValidateToken(request)
    //check user permission
    await this.validateUserPermission(decodedAccessToken, request)
    return true
  }
  private async extractAndValidateToken(request: any): Promise<AccessTokenPayload> {
    const accessToken = this.extractTokenFromHeader(request)
    try {
      const decodedAccessToken = await this.tokenService.verifyAccessToken(accessToken)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      request[REQUEST_USER_KEY] = decodedAccessToken
      return decodedAccessToken
    } catch {
      throw new UnauthorizedException('Error.InvalidAccessToken')
    }
  }
  private extractTokenFromHeader(request: any): string {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const accessToken = request.headers.authorization?.split(' ')[1]
    if (!accessToken) {
      throw new UnauthorizedException('Error.MissingAccessToken')
    }
    return accessToken
  }
  private async validateUserPermission(decodedAccessToken: AccessTokenPayload, request: any) {
    const roleId = decodedAccessToken.roleId

    const path: string = request.route.path

    const method = request.method as keyof typeof HTTPMethod
    const role = await this.prismaService.role
      .findUniqueOrThrow({
        where: {
          id: roleId,
          deletedAt: null,
        },
        include: {
          permissions: {
            where: {
              deletedAt: null,
              path,
              method,
            },
          },
        },
      })
      .catch(() => {
        throw new ForbiddenException('Error.Forbidden')
      })
    const canAccess = role.permissions.length > 0
    if (!canAccess) {
      throw new ForbiddenException('Error.Forbidden')
    }
  }
}
