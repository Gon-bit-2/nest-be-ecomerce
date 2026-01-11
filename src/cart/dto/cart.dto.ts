import { createZodDto } from 'nestjs-zod'
import {
  CartItemSchema,
  GetCartResSchema,
  GetCartItemParamsSchema,
  AddCartBodySchema,
  UpdateCartBodySchema,
  DeleteCartBodySchema,
} from '../cart.model'

export class CartItemDTO extends createZodDto(CartItemSchema) {}
export class GetCartResDTO extends createZodDto(GetCartResSchema) {}
export class GetCartItemParamsDTO extends createZodDto(GetCartItemParamsSchema) {}
export class AddCartBodyDTO extends createZodDto(AddCartBodySchema) {}
export class UpdateCartBodyDTO extends createZodDto(UpdateCartBodySchema) {}
export class DeleteCartBodyDTO extends createZodDto(DeleteCartBodySchema) {}
