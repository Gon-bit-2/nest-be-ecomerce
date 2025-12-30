import { Module } from '@nestjs/common'
import { ProductService } from './product.service'
import { ProductController } from './product.controller'
import { ProductTranslationModule } from './product-translation/product-translation.module'
import { ProductRepo } from './repository/product.repo'

@Module({
  controllers: [ProductController],
  providers: [ProductService, ProductRepo],
  imports: [ProductTranslationModule],
})
export class ProductModule {}
