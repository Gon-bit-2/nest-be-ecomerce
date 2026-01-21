import { createZodDto } from 'nestjs-zod'
import {
  CancelOrderResSchema,
  CreateOrderBodyResSchema,
  CreateOrderBodySchema,
  GetOrderDetailResSchema,
  GetOrderListQuerySchema,
  GetOrderListResSchema,
  GetOrderParamsSchema,
  UpdateOrderStatusSchema,
} from '../order.model'

export class GetOrderListResDTO extends createZodDto(GetOrderListResSchema) {}

export class UpdateOrderStatusDTO extends createZodDto(UpdateOrderStatusSchema) {}

export class GetOrderListQueryDTO extends createZodDto(GetOrderListQuerySchema) {}

export class GetOrderDetailResDTO extends createZodDto(GetOrderDetailResSchema) {}

export class GetOrderParamsDTO extends createZodDto(GetOrderParamsSchema) {}

export class CreateOrderBodyDTO extends createZodDto(CreateOrderBodySchema) {}

export class CreateOrderBodyResDTO extends createZodDto(CreateOrderBodyResSchema) {}

export class CancelOrderResDTO extends createZodDto(CancelOrderResSchema) {}
