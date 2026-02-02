import { Injectable } from '@nestjs/common'
import { ProductRepo } from './repository/product.repo'
import { GetProductsQueryType, SearchProductQueryType } from './product.model'
import { I18nContext } from 'nestjs-i18n'
import { NotFoundRecordException } from 'src/shared/error/error'

@Injectable()
export class ProductService {
  constructor(private readonly productRepo: ProductRepo) {}

  async search(props: { query: SearchProductQueryType }) {
    return this.productRepo.search({
      languageId: I18nContext.current()?.lang as string,
      limit: props.query.limit,
      page: props.query.page,
      q: props.query.q,
    })
  }

  async list(props: { query: GetProductsQueryType }) {
    return this.productRepo.list({
      page: props.query.page,
      limit: props.query.limit,
      languageId: I18nContext.current()?.lang as string,
      isPublic: true,
      name: props.query.name,
      brandIds: props.query.brandIds,
      categories: props.query.categories,
      minPrice: props.query.minPrice,
      maxPrice: props.query.maxPrice,
      createdById: props.query.createdById,
      sortBy: props.query.sortBy,
      orderBy: props.query.orderBy,
    })
  }
  async getDetail(props: { productId: number }) {
    const product = await this.productRepo.getDetail({
      productId: props.productId,
      languageId: I18nContext.current()?.lang as string,
      isPublic: true,
    })
    if (!product) {
      throw NotFoundRecordException
    }
    return product
  }
}
