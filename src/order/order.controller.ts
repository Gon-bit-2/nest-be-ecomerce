import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common'
import { OrderService } from './order.service'
import {
  CancelOrderResDTO,
  CreateOrderBodyDTO,
  CreateOrderBodyResDTO,
  GetOrderDetailResDTO,
  GetOrderListQueryDTO,
  GetOrderListResDTO,
  GetOrderParamsDTO,
  UpdateOrderStatusDTO,
} from './dto/order.dto'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { ZodSerializerDto } from 'nestjs-zod'

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}
  @Get()
  @ZodSerializerDto(GetOrderListResDTO)
  async list(@Query() query: GetOrderListQueryDTO, @ActiveUser('userId') userId: number) {
    return this.orderService.list(userId, query)
  }

  @Get(':orderId')
  @ZodSerializerDto(GetOrderDetailResDTO)
  async detail(@ActiveUser('userId') userId: number, @Param() param: GetOrderParamsDTO) {
    return this.orderService.detail(userId, param.orderId)
  }
  @Post()
  @ZodSerializerDto(CreateOrderBodyResDTO)
  async create(@ActiveUser('userId') userId: number, @Body() body: CreateOrderBodyDTO) {
    return this.orderService.create(userId, body)
  }

  @Put(':orderId')
  @ZodSerializerDto(CancelOrderResDTO)
  async cancel(@ActiveUser('userId') userId: number, @Param() param: GetOrderParamsDTO) {
    return this.orderService.cancel(userId, param.orderId)
  }

  @Post(':orderId/status')
  @ZodSerializerDto(CancelOrderResDTO)
  async updateStatus(
    @ActiveUser('userId') userId: number,
    @Param() param: GetOrderParamsDTO,
    @Body() body: UpdateOrderStatusDTO,
  ) {
    return this.orderService.updateStatus(userId, param.orderId, body)
  }
}
