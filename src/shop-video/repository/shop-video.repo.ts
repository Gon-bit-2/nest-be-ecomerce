import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/service/prisma.service'
import { CreateShopVideoBodyType, ShopVideoQueryType, UpdateShopVideoBodyType } from '../model/shop-video.model'
import { Prisma, VideoStatus } from '@prisma/client'

@Injectable()
export class ShopVideoRepo {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: CreateShopVideoBodyType & { shopId: number }) {
    const { productIds, ...videoData } = data
    return this.prismaService.shopVideo.create({
      data: {
        ...videoData,
        products: productIds?.length
          ? {
              create: productIds.map((id, index) => ({
                product: { connect: { id } },
                displayOrder: index,
              })),
            }
          : undefined,
      },
      include: {
        products: {
          include: {
            product: true,
          },
        },
        shop: {
          select: {
            id: true,
            name: true,
            user: { select: { avatar: true } },
          },
        },
      },
    })
  }

  async list(query: ShopVideoQueryType) {
    const { page, limit, shopId } = query
    const skip = (page - 1) * limit

    const where = {
      deletedAt: null,
      status: VideoStatus.ACTIVE,
      shopId,
    }

    const [data, total] = await Promise.all([
      this.prismaService.shopVideo.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { status: 'asc' }, // ACTIVE first if mixed? Actually status is fixed in where
          { createdAt: 'desc' },
        ],
        include: {
          products: {
            include: {
              product: {
                include: {
                  skus: {
                    select: { id: true },
                    where: { deletedAt: null },
                  },
                },
              },
            },
            orderBy: { displayOrder: 'asc' },
          },
          shop: {
            select: {
              id: true,
              name: true,
              user: { select: { avatar: true } },
            },
          },
        },
      }),
      this.prismaService.shopVideo.count({ where }),
    ])

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  async findById(id: number) {
    return this.prismaService.shopVideo.findUnique({
      where: { id, deletedAt: null },
      include: {
        products: {
          include: {
            product: {
              include: {
                skus: {
                  select: { id: true },
                  where: { deletedAt: null },
                },
              },
            },
          },
          orderBy: { displayOrder: 'asc' },
        },
        shop: {
          select: {
            id: true,
            name: true,
            user: { select: { avatar: true } },
          },
        },
      },
    })
  }

  async update(id: number, data: UpdateShopVideoBodyType) {
    const { productIds, ...updateData } = data

    const videoData: Prisma.ShopVideoUpdateInput = {
      ...updateData,
      status: updateData.status ? (updateData.status as VideoStatus) : undefined,
    }

    if (productIds) {
      videoData.products = {
        deleteMany: {},
        create: productIds.map((pid, idx) => ({
          productId: pid,
          displayOrder: idx,
        })),
      }
    }

    return this.prismaService.shopVideo.update({
      where: { id },
      data: videoData,
    })
  }

  delete({ videoId, deletedById }: { videoId: number; deletedById: number }, isHard?: boolean) {
    return isHard
      ? this.prismaService.shopVideo.delete({
          where: {
            id: videoId,
          },
        })
      : this.prismaService.shopVideo.update({
          where: {
            id: videoId,
            deletedAt: null,
          },
          data: {
            deletedById,
            deletedAt: new Date(),
          },
        })
  }

  async isLiked(videoId: number, userId: number) {
    const count = await this.prismaService.shopVideoLike.count({
      where: { videoId, userId },
    })
    return count > 0
  }

  async toggleLike(videoId: number, userId: number) {
    const existing = await this.prismaService.shopVideoLike.findUnique({
      where: {
        videoId_userId: { videoId, userId },
      },
    })

    if (existing) {
      await this.prismaService.$transaction([
        this.prismaService.shopVideoLike.delete({
          where: { id: existing.id },
        }),
        this.prismaService.shopVideo.update({
          where: { id: videoId },
          data: { likeCount: { decrement: 1 } },
        }),
      ])
      return { liked: false }
    } else {
      await this.prismaService.$transaction([
        this.prismaService.shopVideoLike.create({
          data: { videoId, userId },
        }),
        this.prismaService.shopVideo.update({
          where: { id: videoId },
          data: { likeCount: { increment: 1 } },
        }),
      ])
      return { liked: true }
    }
  }

  async addComment(videoId: number, userId: number, content: string, parentId?: number) {
    const comment = await this.prismaService.$transaction(async (tx) => {
      const newComment = await tx.shopVideoComment.create({
        data: {
          videoId,
          userId,
          content,
          parentId,
        },
        include: {
          user: {
            select: { id: true, name: true, avatar: true },
          },
        },
      })

      await tx.shopVideo.update({
        where: { id: videoId },
        data: { commentCount: { increment: 1 } },
      })

      return newComment
    })
    return comment
  }

  async getComments(videoId: number, page = 1, limit = 20) {
    const skip = (page - 1) * limit
    const [data, total] = await Promise.all([
      this.prismaService.shopVideoComment.findMany({
        where: { videoId, parentId: null }, // Get top-level comments
        include: {
          user: {
            select: { id: true, name: true, avatar: true },
          },
          replies: {
            include: {
              user: {
                select: { id: true, name: true, avatar: true },
              },
            },
            take: 3, // Limit replies preview
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prismaService.shopVideoComment.count({ where: { videoId, parentId: null } }),
    ])

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }
}
