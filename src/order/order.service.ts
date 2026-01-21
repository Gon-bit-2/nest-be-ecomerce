import { Injectable } from '@nestjs/common'
import { OrderRepo } from './repository/order.repo'
import { CreateOrderBodyType, GetOrderListQueryType, UpdateOrderStatusType } from './order.model'

@Injectable()
export class OrderService {
  constructor(private readonly orderRepo: OrderRepo) {}
  async list(userId: number, query: GetOrderListQueryType) {
    return this.orderRepo.list(userId, query)
  }
  async create(userId: number, body: CreateOrderBodyType) {
    const result = await this.orderRepo.create(userId, body)
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
