import { CanActivate, ExecutionContext, HttpException, Injectable, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthType } from 'src/shared/constants/auth.constant'
import { AUTH_TYPE_KEY, AuthTypeDecoratorPayload } from 'src/shared/decorators/auth.decorator'
import { ConditionGuard } from 'src/shared/decorators/custom-validator.decorator'
import { AccessTokenGuard } from 'src/shared/guard/access-token.guard'
import { XApiKeyGuard } from 'src/shared/guard/x-api-key.guard'

@Injectable()
export class AuthenticationGuard implements CanActivate {
  private readonly authTypeGuardMap: Record<string, CanActivate>
  constructor(
    private readonly reflector: Reflector,
    private readonly accessTokenGuard: AccessTokenGuard,
    private readonly apiKeyGuard: XApiKeyGuard,
  ) {
    this.authTypeGuardMap = {
      [AuthType.Bearer]: this.accessTokenGuard,
      [AuthType.APIKey]: this.apiKeyGuard,
      [AuthType.None]: { canActivate: () => true },
    }
  }

  async canActivate(context: ExecutionContext) {
    const authTypeValue = this.getAuthTypeValue(context)
    const authTypes = Array.isArray(authTypeValue.authTypes) ? authTypeValue.authTypes : [authTypeValue.authTypes]
    const guards = authTypes.map((authType) => this.authTypeGuardMap[authType])
    return authTypeValue.options.condition === ConditionGuard.And
      ? this.handleAndCondition(guards, context)
      : this.handleOrCondition(guards, context)
  }
  private getAuthTypeValue(context: ExecutionContext) {
    const authTypeValue = this.reflector.getAllAndOverride<AuthTypeDecoratorPayload | undefined>(AUTH_TYPE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]) ?? { authTypes: [AuthType.Bearer], options: { condition: ConditionGuard.And } }
    return authTypeValue
  }
  private async handleOrCondition(guards: CanActivate[], context: ExecutionContext) {
    let lastError: any = null
    //duyệt qua các guard nếu 1 guard pass thì return true
    for (const instance of guards) {
      try {
        if (await instance.canActivate(context)) {
          return true
        }
      } catch (error) {
        lastError = error
      }
    }
    if (lastError instanceof HttpException) {
      throw lastError
    }
    throw new UnauthorizedException()
  }
  private async handleAndCondition(guards: CanActivate[], context: ExecutionContext) {
    //duyệt qua các guard nếu tất cả guard pass thì return true
    for (const instance of guards) {
      try {
        if (!(await instance.canActivate(context))) {
          throw new UnauthorizedException()
        }
      } catch (error) {
        if (error instanceof HttpException) {
          throw error
        }
        throw new UnauthorizedException()
      }
    }
    return true
  }
}
