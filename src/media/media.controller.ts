/* eslint-disable @typescript-eslint/no-floating-promises */
import {
  Controller,
  Post,
  UseInterceptors,
  MaxFileSizeValidator,
  FileTypeValidator,
  UploadedFiles,
  Get,
  Param,
  Res,
  NotFoundException,
  Body,
} from '@nestjs/common'
import { MediaService } from './media.service'
import { FilesInterceptor } from '@nestjs/platform-express'
import { isPublic } from 'src/shared/decorators/auth.decorator'
import { type Response } from 'express'
import { UPLOAD_DIR } from 'src/shared/constants/other.constant'
import path from 'path'
import { S3Service } from 'src/shared/service/s3.service'
import { ParseFilePipeWithUnlink } from 'src/media/parse-file-pipe-with-unlink.pipe'
import { ZodSerializerDto } from 'nestjs-zod'
import { PresignedUploadFileBodyDTO, PresignedUploadFileResDTO } from 'src/media/dto/media.dto'

@Controller('media')
export class MediaController {
  constructor(
    private readonly mediaService: MediaService,
    private readonly s3Service: S3Service,
  ) {}

  @Post('images/upload')
  @ZodSerializerDto(PresignedUploadFileResDTO)
  @UseInterceptors(FilesInterceptor('file', 100))
  async uploadFile(
    @UploadedFiles(
      new ParseFilePipeWithUnlink({
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
    const result = await this.mediaService.uploadFile(files)
    return result
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
  @Post('images/upload/presigned-url')
  @ZodSerializerDto(PresignedUploadFileResDTO)
  @isPublic()
  async getPresignedUrl(@Body() body: PresignedUploadFileBodyDTO) {
    return this.mediaService.getPresignedUrl(body)
  }
}
