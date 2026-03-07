import {
  Body,
  Controller,
  Delete,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import { ShopVideoService } from './shop-video.service'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { type AccessTokenPayload } from 'src/shared/types/jwt.type'
import { AddCommentDTO, ShopVideoQueryDTO, UpdateShopVideoDTO } from './dto/shop-video.dto'
import { isPublic } from 'src/shared/decorators/auth.decorator'
import { FileInterceptor } from '@nestjs/platform-express'
import { ParseFilePipeWithUnlink } from 'src/media/parse-file-pipe-with-unlink.pipe'
import { VideoMimeTypeValidator } from 'src/media/video-mime-type.validator'

@Controller('shop-video')
export class ShopVideoController {
  constructor(private readonly shopVideoService: ShopVideoService) {}

  @Post()
  @UseInterceptors(FileInterceptor('video'))
  async create(
    @ActiveUser() user: AccessTokenPayload,
    @UploadedFile(
      new ParseFilePipeWithUnlink({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 1024 * 1024 * 100, // 100MB
          }),
          new VideoMimeTypeValidator(),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body('caption') caption?: string,
    @Body('thumbnailUrl') thumbnailUrl?: string,
    @Body('productIds') productIds?: string,
  ) {
    const parsedProductIds = productIds ? JSON.parse(productIds) : undefined
    return this.shopVideoService.create(user.userId, file, {
      caption,
      thumbnailUrl,
      productIds: parsedProductIds,
    })
  }

  @Get()
  @isPublic()
  async list(@Query() query: ShopVideoQueryDTO) {
    return this.shopVideoService.list(query)
  }

  @Get(':id')
  @isPublic()
  async getDetail(@Param('id', ParseIntPipe) id: number, @ActiveUser() user?: AccessTokenPayload) {
    return this.shopVideoService.getDetail(id, user?.userId)
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() user: AccessTokenPayload,
    @Body() body: UpdateShopVideoDTO,
  ) {
    return this.shopVideoService.update(id, user.userId, body)
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number, @ActiveUser() user: AccessTokenPayload) {
    return this.shopVideoService.delete(id, user.userId)
  }

  @Post(':id/like')
  async toggleLike(@Param('id', ParseIntPipe) id: number, @ActiveUser() user: AccessTokenPayload) {
    return this.shopVideoService.toggleLike(id, user.userId)
  }

  @Post(':id/comments')
  async addComment(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() user: AccessTokenPayload,
    @Body() body: AddCommentDTO,
  ) {
    return this.shopVideoService.addComment(id, user.userId, body)
  }

  @Get(':id/comments')
  @isPublic()
  async getComments(
    @Param('id', ParseIntPipe) id: number,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 20,
  ) {
    return this.shopVideoService.getComments(id, page, limit)
  }
}
