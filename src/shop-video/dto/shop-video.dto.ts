import { createZodDto } from 'nestjs-zod'
import {
  AddCommentBodySchema,
  CreateShopVideoBodySchema,
  ShopVideoQuerySchema,
  UpdateShopVideoBodySchema,
} from '../model/shop-video.model'

export class CreateShopVideoDTO extends createZodDto(CreateShopVideoBodySchema) {}
export class UpdateShopVideoDTO extends createZodDto(UpdateShopVideoBodySchema) {}
export class ShopVideoQueryDTO extends createZodDto(ShopVideoQuerySchema) {}
export class AddCommentDTO extends createZodDto(AddCommentBodySchema) {}
