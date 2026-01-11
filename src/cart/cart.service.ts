import { Injectable } from '@nestjs/common'
import { CartRepo } from './repository/cart.repo'
import { AddCartBodyType, DeleteCartBodyType, UpdateCartBodyType } from './cart.model'
import { I18nContext } from 'nestjs-i18n'
import { PaginationQueryType } from 'src/shared/model/request.model'

@Injectable()
export class CartService {
  constructor(private readonly cartRepo: CartRepo) {}

  async getCart(userId: number, query: PaginationQueryType) {
    return this.cartRepo.findAll({
      userId,
      languageId: I18nContext.current()?.lang as string,
      limit: query.limit,
      page: query.page,
    })
  }

  async create(userId: number, body: AddCartBodyType) {
    return this.cartRepo.create(userId, body)
  }

  async update(cartItemId: number, body: UpdateCartBodyType) {
    return this.cartRepo.update(cartItemId, body)
  }

  async delete(userId: number, body: DeleteCartBodyType) {
    const { count } = await this.cartRepo.delete(userId, body)
    return {
      message: `${count} cart item deleted successfully`,
    }
  }
}
