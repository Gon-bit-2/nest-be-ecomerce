/* eslint-disable @typescript-eslint/no-namespace */

import { VariantsType } from './shared/model/shared-product.model'

declare global {
  namespace PrismaJson {
    type Variants = VariantsType
  }
}

// This file must be a module.
export {}
