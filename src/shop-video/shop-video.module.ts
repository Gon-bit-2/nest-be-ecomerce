import { Module } from '@nestjs/common'
import { ShopVideoController } from './shop-video.controller'
import { ShopVideoService } from './shop-video.service'
import { ShopVideoRepo } from './repository/shop-video.repo'
import { MulterModule } from '@nestjs/platform-express'
import multer from 'multer'
import { generateUniqueFileName } from 'src/helper/helpers'
import { existsSync, mkdirSync } from 'fs'
import { UPLOAD_DIR } from 'src/shared/constants/other.constant'

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR)
  },
  filename: (req, file, cb) => {
    const newFileName = generateUniqueFileName(file.originalname)
    cb(null, newFileName)
  },
})

@Module({
  imports: [
    MulterModule.register({
      storage,
    }),
  ],
  controllers: [ShopVideoController],
  providers: [ShopVideoService, ShopVideoRepo],
  exports: [ShopVideoService],
})
export class ShopVideoModule {
  constructor() {
    if (!existsSync(UPLOAD_DIR)) {
      mkdirSync(UPLOAD_DIR, { recursive: true })
    }
  }
}
