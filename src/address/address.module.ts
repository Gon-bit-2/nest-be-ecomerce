import { Module } from '@nestjs/common'
import { AddressService } from './address.service'
import { AddressController } from './address.controller'
import { AddressRepo } from './repository/address.repo'

@Module({
  controllers: [AddressController],
  providers: [AddressService, AddressRepo],
  exports: [AddressService],
})
export class AddressModule {}
