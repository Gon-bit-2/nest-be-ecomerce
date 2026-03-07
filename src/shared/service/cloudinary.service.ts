import { Injectable } from '@nestjs/common'
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary'
import envConfig from 'src/shared/config'

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: envConfig.CLOUDINARY_CLOUD_NAME,
      api_key: envConfig.CLOUDINARY_API_KEY,
      api_secret: envConfig.CLOUDINARY_API_SECRET,
    })
  }

  async uploadFile({
    fileName,
    filePath,
    contentType,
    folder,
  }: {
    fileName: string
    filePath: string
    contentType: string
    folder?: string
  }): Promise<{ Location: string; Key: string }> {
    const isVideo = contentType.startsWith('video/')
    const resourceType = isVideo ? 'video' : 'image'
    const uploadFolder = folder ?? (isVideo ? 'videos' : 'images')

    const result: UploadApiResponse = await cloudinary.uploader.upload(filePath, {
      public_id: fileName.replace(/\.[^/.]+$/, ''),
      folder: uploadFolder,
      resource_type: resourceType,
      overwrite: true,
    })

    return {
      Location: result.secure_url,
      Key: result.public_id,
    }
  }

  createPresignedUrlWithClient(fileName: string): string {
    const timestamp = Math.round(new Date().getTime() / 1000) + 3600
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        public_id: fileName.replace(/\.[^/.]+$/, ''),
        folder: 'images',
      },
      envConfig.CLOUDINARY_API_SECRET,
    )

    return `https://api.cloudinary.com/v1_1/${envConfig.CLOUDINARY_CLOUD_NAME}/image/upload?public_id=${encodeURIComponent(fileName.replace(/\.[^/.]+$/, ''))}&folder=images&timestamp=${timestamp}&signature=${signature}&api_key=${envConfig.CLOUDINARY_API_KEY}`
  }
}
