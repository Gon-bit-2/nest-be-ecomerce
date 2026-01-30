import { Injectable } from '@nestjs/common'
import { unlink } from 'fs'
import { generateUniqueFileName } from 'src/helper/helpers'
import { PresignedUploadFileBodyType } from 'src/media/media.model'
import { S3Service } from 'src/shared/service/s3.service'

@Injectable()
export class MediaService {
  constructor(private readonly s3Service: S3Service) {}
  async uploadFile(files: Array<Express.Multer.File>) {
    const result = await Promise.all(
      files.map((file) => {
        return this.s3Service
          .uploadFile({
            fileName: 'images/' + file.filename,
            filePath: file.path,
            contentType: file.mimetype,
          })
          .then((res) => {
            return {
              url: res.Location,
              name: file.originalname,
              key: res.Key,
              type: file.mimetype,
            }
          })
      }),
    )
    //sau khi upload xong lên S3 xoa file trong upload folder
    await Promise.all(
      files.map((file) => {
        return unlink(file.path, (err) => {
          if (err) {
            console.error('Error deleting file:', err)
          }
        })
      }),
    )
    return {
      data: result,
    }
  }
  async getPresignedUrl(body: PresignedUploadFileBodyType) {
    const randomFileName = generateUniqueFileName(body.fileName)
    const preSignedUrl = await this.s3Service.createPresignedUrlWithClient(randomFileName)
    return {
      preSignedUrl,
      fileName: randomFileName,
    }
  }
}
