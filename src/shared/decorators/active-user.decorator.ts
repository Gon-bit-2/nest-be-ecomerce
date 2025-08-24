import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { TokenPayload } from 'src/shared/types/jwt.type'

export const ActiveUser = createParamDecorator((field: keyof TokenPayload | undefined, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest()
  const user: TokenPayload = request.user
  return field ? user[field] : user
})
