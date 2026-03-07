import { BadRequestException, NotFoundException } from '@nestjs/common'

export const AddressNotFoundException = new NotFoundException('Error.AddressNotFound')
export const MaxDefaultAddressException = new BadRequestException('Error.MaxDefaultAddress')
