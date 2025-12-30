import { Module } from '@nestjs/common'
import { ProductService } from './product.service'
import { ProductController } from './product.controller'
import { ProductTranslationModule } from './product-translation/product-translation.module'
import { ProductRepo } from './repository/product.repo'
import { ManageProductController } from './manage-product.controller'
import { ManageProductService } from './manage-product.service'

@Module({
  controllers: [ProductController, ManageProductController],
  providers: [ProductService, ManageProductService, ProductRepo],
  imports: [ProductTranslationModule],
})
export class ProductModule {}
