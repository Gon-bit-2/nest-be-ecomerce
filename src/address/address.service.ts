import { Injectable } from '@nestjs/common'
import { AddressRepo } from './repository/address.repo'
import { CreateAddressBodyType, UpdateAddressBodyType } from './address.model'

@Injectable()
export class AddressService {
  constructor(private readonly addressRepo: AddressRepo) {}

  list(userId: number) {
    return this.addressRepo.list(userId)
  }

  detail(userId: number, addressId: number) {
    return this.addressRepo.detail(userId, addressId)
  }

  create(userId: number, body: CreateAddressBodyType) {
    return this.addressRepo.create(userId, body)
  }

  update(userId: number, addressId: number, body: UpdateAddressBodyType) {
    return this.addressRepo.update(userId, addressId, body)
  }

  delete(userId: number, addressId: number) {
    return this.addressRepo.delete(userId, addressId)
  }

  setDefault(userId: number, addressId: number) {
    return this.addressRepo.setDefault(userId, addressId)
  }

  findById(userId: number, addressId: number) {
    return this.addressRepo.findById(userId, addressId)
  }
}
