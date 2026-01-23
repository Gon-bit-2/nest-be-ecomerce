export const DISCOUNT_TYPE = {
  PERCENTAGE: 'PERCENTAGE',
  FIXED_AMOUNT: 'FIXED_AMOUNT',
  SHIPPING: 'SHIPPING',
  COIN_CASHBACK: 'COIN_CASHBACK',
} as const

export const DISCOUNT_SCOPE = {
  PLATFORM: 'PLATFORM',
  SHOP: 'SHOP',
} as const

export const DISCOUNT_APPLY_TO = {
  ALL: 'ALL',
  SPECIFIC: 'SPECIFIC',
} as const

export type DiscountType = (typeof DISCOUNT_TYPE)[keyof typeof DISCOUNT_TYPE]
export type DiscountScopeType = (typeof DISCOUNT_SCOPE)[keyof typeof DISCOUNT_SCOPE]
export type DiscountApplyToType = (typeof DISCOUNT_APPLY_TO)[keyof typeof DISCOUNT_APPLY_TO]
