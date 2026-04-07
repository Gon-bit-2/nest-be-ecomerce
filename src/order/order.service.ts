import { Injectable } from '@nestjs/common'
import { OrderRepo } from './repository/order.repo'
import { CreateOrderBodyType, GetOrderListQueryType, UpdateOrderStatusType } from './order.model'
import { AddressService } from 'src/address/address.service'
import { EventEmitter2 } from '@nestjs/event-emitter'
@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepo: OrderRepo,
    private readonly addressService: AddressService,
    private readonly eventEmitter: EventEmitter2,
  ) {}
  async list(userId: number, query: GetOrderListQueryType, roleName: string) {
    return this.orderRepo.list(userId, query, roleName)
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
    //
    result.orders.forEach((order) => {
      this.eventEmitter.emit('notification.send', {
        userId: userId, // Bắn cho người mua
        title: 'Đặt hàng thành công!',
        body: `Đơn hàng #${order.id} của bạn đã được ghi nhận.`,
        type: 'ORDER',
        data: { orderId: order.id, url: `/user/orders/${order.id}` },
      })

      // (Tính năng mở rộng sau này) Bắn cho chủ Shop biết có đơn mới
      // this.eventEmitter.emit('notification.send', {
      //   userId: order.shopId, // hoặc userId chủ shop
      //   title: 'Đơn hàng mới',
      //   body: `Bạn vừa có đơn hàng mới #${order.id}.`,
      //   type: 'SELLER_ORDER'
      // })
    })
    return result
  }
  async detail(userId: number, orderId: number, roleName: string) {
    return this.orderRepo.detail(userId, orderId, roleName)
  }
  async cancel(userId: number, orderId: number, roleName: string) {
    const cancelledOrder = await this.orderRepo.cancel(userId, orderId, roleName)
    this.eventEmitter.emit('notification.send', {
      userId: userId, // Bắn cho người mua
      title: 'Đơn hàng đã được hủy',
      body: `Đơn hàng #${cancelledOrder.id} của bạn đã được hủy.`,
      type: 'ORDER',
      data: { orderId: cancelledOrder.id, url: `/user/orders/${cancelledOrder.id}` },
    })

    return cancelledOrder
  }
  async updateStatus(userId: number, orderId: number, body: UpdateOrderStatusType, roleName: string) {
    return this.orderRepo.updateStatus(orderId, userId, body, roleName)
  }
}
