import { Injectable } from '@nestjs/common'
import { S3 } from '@aws-sdk/client-s3'
import envConfig from 'src/shared/config'
import { Upload } from '@aws-sdk/lib-storage'
import { readFileSync } from 'fs'
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
  async uploadFile({ fileName, filePath, contentType }: { fileName: string; filePath: string; contentType: string }) {
    const parallelUploads3 = new Upload({
      client: this.s3,
      params: {
        Bucket: envConfig.S3_BUCKET_NAME,
        Key: fileName,
        Body: readFileSync(filePath),
        ContentType: contentType,
      },

      // optional tags
      tags: [
        /*...*/
      ],

      // additional optional fields show default values below:

      // (optional) concurrency configuration
      queueSize: 4,

      // (optional) size of each part, in bytes, at least 5MB
      partSize: 1024 * 1024 * 5,

      // (optional) when true, do not automatically call AbortMultipartUpload when
      // a multipart upload fails to complete. You should then manually handle
      // the leftover parts.
      leavePartsOnError: false,
    })

    parallelUploads3.on('httpUploadProgress', (progress) => {
      console.log(progress)
    })

    return parallelUploads3.done()
  }
}
