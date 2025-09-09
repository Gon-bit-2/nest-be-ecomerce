import { AccessTokenPayload } from 'src/shared/types/jwt.type'

declare module 'express-serve-static-core' {
  interface Request {
    user?: AccessTokenPayload
  }
}
