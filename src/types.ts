/* eslint-disable @typescript-eslint/no-namespace */

import { ProductTranslationType } from './shared/model/shared-product-translation.model'
import { VariantsType } from './shared/model/shared-product.model'

declare global {
  namespace PrismaJson {
    type Variants = VariantsType
    type ProductTranslation = Pick<ProductTranslationType, 'id' | 'name' | 'description' | 'languageId'>[]
    type Receiver = {
      name: string
      phone: string
      address: string
    }
    type NotificationDataType = {
      orderId?: number
      url?: string
      [key: string]: any
    }
  }
}

// This file must be a module.
export {}
