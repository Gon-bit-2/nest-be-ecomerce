import { Injectable, NotFoundException } from '@nestjs/common'
import {
  CreateBrandTranslationBodyType,
  UpdateBrandTranslationBodyType,
} from 'src/brand/brand-translation/brand-translation.model'
import { BrandTranslationRepo } from 'src/brand/brand-translation/brand-translation.repo'
import { NotFoundRecordException } from 'src/shared/error/error'

@Injectable()
export class BrandTranslationService {
  constructor(private readonly brandTranslationRepo: BrandTranslationRepo) {}
  findById(id: number) {
    return this.brandTranslationRepo.findById(id)
  }
  create({ data, createdById }: { data: CreateBrandTranslationBodyType; createdById: number }) {
    return this.brandTranslationRepo.create({ data, createdById })
  }
  update({ id, updatedById, data }: { id: number; updatedById: number; data: UpdateBrandTranslationBodyType }) {
    try {
      const brandTranslation = this.brandTranslationRepo.update({ id, updatedById, data })
      return brandTranslation
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw NotFoundRecordException
      }
      throw error
    }
  }
  async delete({ id, deletedById }: { id: number; deletedById: number }) {
    try {
      await this.brandTranslationRepo.delete({ id, deletedById })
      return {
        message: 'Brand translation deleted successfully',
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw NotFoundRecordException
      }
      throw error
    }
  }
}
