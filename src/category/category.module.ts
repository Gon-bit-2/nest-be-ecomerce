import { Module } from '@nestjs/common'
import { CategoryService } from './category.service'
import { CategoryController } from './category.controller'
import { CategoryTransalitonModule } from './category-transaliton/category-transaliton.module'
import { CategoryRepo } from './repository/category.repo'

@Module({
  controllers: [CategoryController],
  providers: [CategoryService, CategoryRepo],
  imports: [CategoryTransalitonModule],
})
export class CategoryModule {}
