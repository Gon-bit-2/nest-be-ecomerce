import { Module } from '@nestjs/common'
import { BrandTranslationController } from 'src/brand/brand-translation/brand-translation.controller'
import { BrandTranslationRepo } from 'src/brand/brand-translation/brand-translation.repo'
import { BrandTranslationService } from 'src/brand/brand-translation/brand-translation.service'

@Module({
  controllers: [BrandTranslationController],
  providers: [BrandTranslationService, BrandTranslationRepo],
})
export class BrandTranslationModule {}
