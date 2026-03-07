import { Injectable } from '@nestjs/common'
import { OrderRepo } from './repository/order.repo'
import { CreateOrderBodyType, GetOrderListQueryType, UpdateOrderStatusType } from './order.model'
import { AddressService } from 'src/address/address.service'

@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepo: OrderRepo,
    private readonly addressService: AddressService,
  ) {}
  async list(userId: number, query: GetOrderListQueryType) {
    return this.orderRepo.list(userId, query)
  }
  async create(userId: number, body: CreateOrderBodyType) {
    // Resolve userAddressId thành receiver nếu cần
    const resolvedBody = await Promise.all(
      body.map(async (item) => {
        if (item.userAddressId && !item.receiver) {
          const address = await this.addressService.findById(userId, item.userAddressId)
          return {
            ...item,
            receiver: {
              name: address.name,
              phone: address.phone,
              address: address.address,
            },
          }
        }
        if (!item.receiver) {
          throw new Error('Either receiver or userAddressId must be provided')
        }
        return item as typeof item & { receiver: { name: string; phone: string; address: string } }
      }),
    )
    const result = await this.orderRepo.create(userId, resolvedBody)
    return result
  }
  async detail(userId: number, orderId: number) {
    return this.orderRepo.detail(userId, orderId)
  }
  async cancel(userId: number, orderId: number) {
    return this.orderRepo.cancel(userId, orderId)
  }
  async updateStatus(userId: number, orderId: number, body: UpdateOrderStatusType) {
    return this.orderRepo.updateStatus(orderId, userId, body)
  }
}
