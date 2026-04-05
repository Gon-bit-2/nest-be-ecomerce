import { Injectable, BadRequestException } from '@nestjs/common'
import { ShopRepo } from './repository/shop.repo'
import { RegisterShopBodyType } from './shop.model'

@Injectable()
export class ShopService {
  constructor(private readonly shopRepo: ShopRepo) {}

  async register(userId: number, data: RegisterShopBodyType) {
    const existingShop = await this.shopRepo.findByUserId(userId)
    if (existingShop) {
      throw new BadRequestException('User already has a shop or created a register request')
    }

    await this.shopRepo.create({ userId, data })

    return {
      message: 'Shop registration created successfully. Please wait for admin approval.',
    }
  }

  async getMyShop(userId: number) {
    const shop = await this.shopRepo.findByUserId(userId)
    return shop
  }

  async getStatistics(userId: number) {
    const shop = await this.shopRepo.findByUserId(userId)
    if (!shop) {
      throw new BadRequestException('User does not have a shop')
    }

    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    return this.shopRepo.getStatistics(shop.id, startOfToday, startOfMonth)
  }
}
