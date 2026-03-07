import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'
import { AddressService } from './address.service'
import {
  CreateAddressBodyDTO,
  GetAddressDetailResDTO,
  GetAddressListResDTO,
  GetAddressParamsDTO,
  SetDefaultAddressResDTO,
  UpdateAddressBodyDTO,
} from './dto/address.dto'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { ZodSerializerDto } from 'nestjs-zod'

@Controller('address')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Get()
  @ZodSerializerDto(GetAddressListResDTO)
  async list(@ActiveUser('userId') userId: number) {
    return this.addressService.list(userId)
  }

  @Get(':addressId')
  @ZodSerializerDto(GetAddressDetailResDTO)
  async detail(@ActiveUser('userId') userId: number, @Param() param: GetAddressParamsDTO) {
    return this.addressService.detail(userId, param.addressId)
  }

  @Post()
  @ZodSerializerDto(GetAddressDetailResDTO)
  async create(@ActiveUser('userId') userId: number, @Body() body: CreateAddressBodyDTO) {
    return this.addressService.create(userId, body)
  }

  @Put(':addressId')
  @ZodSerializerDto(GetAddressDetailResDTO)
  async update(
    @ActiveUser('userId') userId: number,
    @Param() param: GetAddressParamsDTO,
    @Body() body: UpdateAddressBodyDTO,
  ) {
    return this.addressService.update(userId, param.addressId, body)
  }

  @Delete(':addressId')
  async delete(@ActiveUser('userId') userId: number, @Param() param: GetAddressParamsDTO) {
    return this.addressService.delete(userId, param.addressId)
  }

  @Put(':addressId/default')
  @ZodSerializerDto(SetDefaultAddressResDTO)
  async setDefault(@ActiveUser('userId') userId: number, @Param() param: GetAddressParamsDTO) {
    return this.addressService.setDefault(userId, param.addressId)
  }
}
