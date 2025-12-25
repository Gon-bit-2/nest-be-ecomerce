import { Injectable, NotFoundException } from '@nestjs/common'
import { BrandRepo } from 'src/brand/repository/brand.repo'
import { PaginationQueryType } from 'src/shared/model/request.model'
import { NotFoundRecordException } from 'src/shared/error/error'
import { CreateBrandBodyType, UpdateBrandBodyType } from 'src/brand/brand.model'

@Injectable()
export class BrandService {
  constructor(private readonly brandRepo: BrandRepo) {}
  async list(pagination: PaginationQueryType) {
    const data = await this.brandRepo.list(pagination)
    return data
  }
  async findById(id: number) {
    const brand = await this.brandRepo.findById(id)
    if (!brand) {
      throw NotFoundRecordException
    }
    return brand
  }
  create({ data, createdById }: { data: CreateBrandBodyType; createdById: number }) {
    return this.brandRepo.create({ data, createdById })
  }
  async update({ id, updatedById, data }: { id: number; updatedById: number; data: UpdateBrandBodyType }) {
    try {
      const checkBrand = await this.brandRepo.findById(id)
      if (!checkBrand) {
        throw NotFoundRecordException
      }
      const updateBrand = this.brandRepo.update({
        id,
        data,
        updatedById,
      })
      return updateBrand
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw NotFoundRecordException
      }
      throw error
    }
  }
  async delete({ id, deletedById }: { id: number; deletedById: number }) {
    try {
      const checkBrand = await this.brandRepo.findById(id)
      if (!checkBrand) {
        throw NotFoundRecordException
      }
      await this.brandRepo.delete({ id, deletedById })
      return {
        message: 'Brand deleted successfully',
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw NotFoundRecordException
      }
      throw error
    }
  }
}
