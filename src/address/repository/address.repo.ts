import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/service/prisma.service'
import { CreateAddressBodyType, UpdateAddressBodyType } from '../address.model'
import { AddressNotFoundException } from '../address.error'

@Injectable()
export class AddressRepo {
  constructor(private readonly prismaService: PrismaService) {}

  async list(userId: number) {
    const data = await this.prismaService.userAddress.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    })
    return { data }
  }

  async detail(userId: number, addressId: number) {
    const address = await this.prismaService.userAddress.findFirst({
      where: { id: addressId, userId },
    })
    if (!address) {
      throw AddressNotFoundException
    }
    return address
  }

  async create(userId: number, body: CreateAddressBodyType) {
    // Nếu đặt làm mặc định, bỏ mặc định của các địa chỉ khác
    if (body.isDefault) {
      await this.prismaService.userAddress.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      })
    }
    // Nếu là địa chỉ đầu tiên, tự động đặt làm mặc định
    const count = await this.prismaService.userAddress.count({ where: { userId } })
    const isDefault = count === 0 ? true : body.isDefault

    return this.prismaService.userAddress.create({
      data: {
        userId,
        name: body.name,
        phone: body.phone,
        address: body.address,
        isDefault,
      },
    })
  }

  async update(userId: number, addressId: number, body: UpdateAddressBodyType) {
    const address = await this.prismaService.userAddress.findFirst({
      where: { id: addressId, userId },
    })
    if (!address) {
      throw AddressNotFoundException
    }
    // Nếu đặt làm mặc định, bỏ mặc định của các địa chỉ khác
    if (body.isDefault) {
      await this.prismaService.userAddress.updateMany({
        where: { userId, isDefault: true, id: { not: addressId } },
        data: { isDefault: false },
      })
    }
    return this.prismaService.userAddress.update({
      where: { id: addressId },
      data: body,
    })
  }

  async delete(userId: number, addressId: number) {
    const address = await this.prismaService.userAddress.findFirst({
      where: { id: addressId, userId },
    })
    if (!address) {
      throw AddressNotFoundException
    }
    await this.prismaService.userAddress.delete({
      where: { id: addressId },
    })
    // Nếu xóa địa chỉ mặc định, đặt địa chỉ mới nhất làm mặc định
    if (address.isDefault) {
      const latest = await this.prismaService.userAddress.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      })
      if (latest) {
        await this.prismaService.userAddress.update({
          where: { id: latest.id },
          data: { isDefault: true },
        })
      }
    }
    return { message: 'Address deleted successfully' }
  }

  async setDefault(userId: number, addressId: number) {
    const address = await this.prismaService.userAddress.findFirst({
      where: { id: addressId, userId },
    })
    if (!address) {
      throw AddressNotFoundException
    }
    await this.prismaService.userAddress.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    })
    return this.prismaService.userAddress.update({
      where: { id: addressId },
      data: { isDefault: true },
    })
  }

  async findById(userId: number, addressId: number) {
    const address = await this.prismaService.userAddress.findFirst({
      where: { id: addressId, userId },
    })
    if (!address) {
      throw AddressNotFoundException
    }
    return address
  }
}
