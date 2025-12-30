import { createZodDto } from 'nestjs-zod'
import {
  CreateProductBodySchema,
  GetManageProductQuerySchema,
  GetProductDetailResSchema,
  GetProductParamsSchema,
  GetProductsQuerySchema,
  GetProductsResSchema,
  ProductSchema,
  UpdateProductBodySchema,
} from '../product.model'

export class ProductDTO extends createZodDto(ProductSchema) {}
export class GetProductResDTO extends createZodDto(GetProductsResSchema) {}
export class GetProductParamsDTO extends createZodDto(GetProductParamsSchema) {}
export class GetProductQueryDTO extends createZodDto(GetProductsQuerySchema) {}
export class GetManageProductQueryDTO extends createZodDto(GetManageProductQuerySchema) {}
export class GetProductDetailResDTO extends createZodDto(GetProductDetailResSchema) {}
export class CreateProductBodyDTO extends createZodDto(CreateProductBodySchema) {}
export class UpdateProductBodyDTO extends createZodDto(UpdateProductBodySchema) {}
