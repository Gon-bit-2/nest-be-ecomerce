import { Injectable, NotFoundException } from '@nestjs/common'
import { ShopVideoRepo } from './repository/shop-video.repo'
import { AddCommentBodyType, ShopVideoQueryType, UpdateShopVideoBodyType } from './model/shop-video.model'
import { CloudinaryService } from 'src/shared/service/cloudinary.service'
import { unlink } from 'fs'

@Injectable()
export class ShopVideoService {
  constructor(
    private readonly shopVideoRepo: ShopVideoRepo,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(
    shopId: number,
    file: Express.Multer.File,
    metadata: { caption?: string; thumbnailUrl?: string; productIds?: number[] },
  ) {
    const uploaded = await this.cloudinaryService.uploadFile({
      fileName: file.filename,
      filePath: file.path,
      contentType: file.mimetype,
      folder: 'videos',
    })

    unlink(file.path, (err) => {
      if (err) console.error('Error deleting temp file:', err)
    })

    return this.shopVideoRepo.create({
      videoUrl: uploaded.Location,
      caption: metadata.caption,
      thumbnailUrl: metadata.thumbnailUrl,
      productIds: metadata.productIds,
      shopId,
    })
  }

  async list(query: ShopVideoQueryType) {
    const result = await this.shopVideoRepo.list(query)
    result.data = result.data.map((video: any) => {
      return {
        ...video,
        products: video.products.map((p: any) => {
          const { skus, ...productData } = p.product
          const has_variants = skus && skus.length > 1
          return {
            ...p,
            product: {
              ...productData,
              has_variants,
            },
          }
        }),
      }
    }) as any
    return result
  }

  async getDetail(id: number, userId?: number) {
    const video = await this.shopVideoRepo.findById(id)
    if (!video) throw new NotFoundException('Video not found')

    let isLiked = false
    if (userId) {
      isLiked = await this.shopVideoRepo.isLiked(id, userId)
    }

    return {
      ...video,
      products: (video as any).products.map((p: any) => {
        const { skus, ...productData } = p.product
        const has_variants = skus && skus.length > 1
        return {
          ...p,
          product: {
            ...productData,
            has_variants,
          },
        }
      }),
      isLiked,
    }
  }

  async update(id: number, userId: number, body: UpdateShopVideoBodyType) {
    // TODO: Check if user owns the video (authorization usually in Controller or Guard, but safe check here good)
    const video = await this.shopVideoRepo.findById(id)
    if (!video) throw new NotFoundException('Video not found')
    if (video.shopId !== userId) throw new NotFoundException('Permission denied') // Or ForbiddenException

    return this.shopVideoRepo.update(id, body)
  }

  async delete(id: number, userId: number) {
    const video = await this.shopVideoRepo.findById(id)
    if (!video) throw new NotFoundException('Video not found')
    if (video.shopId !== userId) throw new NotFoundException('Permission denied')

    return this.shopVideoRepo.delete({ videoId: id, deletedById: userId })
  }

  async toggleLike(id: number, userId: number) {
    const video = await this.shopVideoRepo.findById(id)
    if (!video) throw new NotFoundException('Video not found')

    return this.shopVideoRepo.toggleLike(id, userId)
  }

  async addComment(id: number, userId: number, body: AddCommentBodyType) {
    const video = await this.shopVideoRepo.findById(id)
    if (!video) throw new NotFoundException('Video not found')

    return this.shopVideoRepo.addComment(id, userId, body.content, body.parentId)
  }

  async getComments(id: number, page: number, limit: number) {
    return this.shopVideoRepo.getComments(id, page, limit)
  }
}
