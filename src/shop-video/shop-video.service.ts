import { Injectable, NotFoundException } from '@nestjs/common'
import { ShopVideoRepo } from './repository/shop-video.repo'
import {
  AddCommentBodyType,
  CreateShopVideoBodyType,
  ShopVideoQueryType,
  UpdateShopVideoBodyType,
} from './model/shop-video.model'

@Injectable()
export class ShopVideoService {
  constructor(private readonly shopVideoRepo: ShopVideoRepo) {}

  async create(shopId: number, body: CreateShopVideoBodyType) {
    return this.shopVideoRepo.create({
      ...body,
      shopId,
    })
  }

  async list(query: ShopVideoQueryType) {
    return this.shopVideoRepo.list(query)
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
