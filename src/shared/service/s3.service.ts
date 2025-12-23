import { Injectable } from '@nestjs/common'
import { S3 } from '@aws-sdk/client-s3'
import envConfig from 'src/shared/config'
@Injectable()
export class S3Service {
  // Implement S3 related methods here
  private s3: S3
  constructor() {
    this.s3 = new S3({
      region: envConfig.S3_REGION,
      credentials: {
        accessKeyId: envConfig.S3_ACCESS_KEY,
        secretAccessKey: envConfig.S3_SECRET_KEY,
      },
    })
  }
}
