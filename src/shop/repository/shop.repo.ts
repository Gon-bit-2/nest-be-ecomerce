import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/service/prisma.service'
import { RegisterShopBodyType } from '../shop.model'

@Injectable()
export class ShopRepo {
  constructor(private readonly prismaService: PrismaService) {}

  async create({ userId, data }: { userId: number; data: RegisterShopBodyType }) {
    return await this.prismaService.shop.create({
      data: {
        id: userId,
        ...data,
      },
    })
  }

  async findByUserId(userId: number) {
    return this.prismaService.shop.findUnique({
      where: {
        id: userId,
      },
    })
  }
}
