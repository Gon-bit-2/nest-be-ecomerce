import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common'
import { CartService } from './cart.service'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { ZodSerializerDto, ZodValidationPipe } from 'nestjs-zod'
import { PaginationQueryDTO } from 'src/shared/dtos/request.dto'
import {
  AddCartBodyDTO,
  CartItemDTO,
  DeleteCartBodyDTO,
  GetCartItemParamsDTO,
  GetCartResDTO,
  UpdateCartBodyDTO,
} from './dto/cart.dto'
import { MessageResDTO } from 'src/shared/dtos/response.dto'

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ZodSerializerDto(GetCartResDTO)
  async getCart(@Query(ZodValidationPipe) query: PaginationQueryDTO, @ActiveUser('userId') userId: number) {
    return this.cartService.getCart(userId, query)
  }

  @Post()
  @ZodSerializerDto(CartItemDTO)
  async create(@ActiveUser('userId') userId: number, @Body() body: AddCartBodyDTO) {
    return this.cartService.create(userId, body)
  }

  @Put()
  @ZodSerializerDto(CartItemDTO)
  async update(
    @Param() params: GetCartItemParamsDTO,
    @Body() body: UpdateCartBodyDTO,
    @ActiveUser('userId') userId: number,
  ) {
    return this.cartService.update({ userId, cartItemId: params.cartItemId, body })
  }

  @Post('delete')
  @ZodSerializerDto(MessageResDTO)
  async delete(@ActiveUser('userId') userId: number, @Body() body: DeleteCartBodyDTO) {
    return this.cartService.delete(userId, body)
  }
}
