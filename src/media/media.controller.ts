import {
  Controller,
  Post,
  UseInterceptors,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  UploadedFiles,
  Get,
  Param,
  Res,
  NotFoundException,
} from '@nestjs/common'
import { MediaService } from './media.service'

import { FilesInterceptor } from '@nestjs/platform-express'
import envConfig from 'src/shared/config'
import { isPublic } from 'src/shared/decorators/auth.decorator'
import { type Response } from 'express'
import { UPLOAD_DIR } from 'src/shared/constants/other.constant'
import path from 'path'

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('images/upload')
  @UseInterceptors(FilesInterceptor('file', 100))
  uploadFile(
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 1024 * 1024 * 5,
          }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
        ],
      }),
    )
    files: Array<Express.Multer.File>,
  ) {
    console.log(files)
    return files.map((file) => ({
      url: `${envConfig.PREFIX_STATIC_ENDPOINT}/${file.filename}`,
    }))
  }
  @Get('static/:filename')
  @isPublic()
  serveFile(@Param('filename') filename: string, @Res() res: Response) {
    return res.sendFile(path.resolve(UPLOAD_DIR, filename), (error) => {
      const notFound = new NotFoundException('File not found')
      if (error) {
        res.status(notFound.getStatus()).json(notFound.getResponse())
      }
    })
  }
}
