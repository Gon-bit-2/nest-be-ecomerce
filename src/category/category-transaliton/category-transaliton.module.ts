import { Module } from '@nestjs/common'
import { CategoryTransalitonService } from './category-transaliton.service'
import { CategoryTransalitonController } from './category-transaliton.controller'
import { CategoryTranslationRepo } from './repository/category-translation.repo'

@Module({
  controllers: [CategoryTransalitonController],
  providers: [CategoryTransalitonService, CategoryTranslationRepo],
})
export class CategoryTransalitonModule {}
