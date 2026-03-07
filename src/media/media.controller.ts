import {
  Controller,
  Post,
  UseInterceptors,
  MaxFileSizeValidator,
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
import { ParseFilePipeWithUnlink } from 'src/media/parse-file-pipe-with-unlink.pipe'
import { ZodSerializerDto } from 'nestjs-zod'
import { PresignedUploadFileBodyDTO, PresignedUploadFileResDTO, UploadedFilesDTO } from 'src/media/dto/media.dto'
import { ImageMimeTypeValidator } from './image-mime-type.validator'
import { VideoMimeTypeValidator } from './video-mime-type.validator'

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('images/upload')
  @ZodSerializerDto(UploadedFilesDTO)
  @UseInterceptors(FilesInterceptor('file', 100))
  async uploadFile(
    @UploadedFiles(
      new ParseFilePipeWithUnlink({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 1024 * 1024 * 5,
          }),
          new ImageMimeTypeValidator(),
        ],
      }),
    )
    files: Array<Express.Multer.File>,
  ) {
    return this.mediaService.uploadFile(files)
  }
  @Post('videos/upload')
  @ZodSerializerDto(UploadedFilesDTO)
  @UseInterceptors(FilesInterceptor('file', 10))
  async uploadVideo(
    @UploadedFiles(
      new ParseFilePipeWithUnlink({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 1024 * 1024 * 100, // 100MB
          }),
          new VideoMimeTypeValidator(),
        ],
      }),
    )
    files: Array<Express.Multer.File>,
  ) {
    return this.mediaService.uploadVideo(files)
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
