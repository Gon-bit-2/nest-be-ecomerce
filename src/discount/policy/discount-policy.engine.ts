import { BadRequestException } from '@nestjs/common'

export type DiscountScope = 'PLATFORM' | 'SHOP'
export type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT' | 'SHIPPING' | 'COIN_CASHBACK'
export type DiscountApplyTo = 'ALL' | 'SPECIFIC'

export type DiscountPolicyDiscount = {
  id: number
  code: string
  type: DiscountType
  scope: DiscountScope
  applyTo: DiscountApplyTo
  value: number
  maxDiscountValue: number | null
  minOrderValue: number
  maxTotalUses: number
  useCount: number
  maxUsesPerUser: number
  startDate: Date
  endDate: Date
  shopId: number | null
  products: Array<{ productId: number }>
  categories: Array<{ categoryId: number }>
}

export type DiscountPolicyItem = {
  productId: number
  categoryIds: number[]
  price: number
  quantity: number
}

export function getOrderValue(items: DiscountPolicyItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}

export function assertDiscountScopeForApply(params: {
  discount: Pick<DiscountPolicyDiscount, 'scope' | 'shopId'>
  expectedScope: DiscountScope
  shopId: number
  code: string
}) {
  const { discount, expectedScope, shopId, code } = params

  if (discount.scope !== expectedScope) {
    throw new BadRequestException(`Mã "${code}" không đúng loại voucher`)
  }

  if (discount.scope === 'SHOP' && discount.shopId !== shopId) {
    throw new BadRequestException(`Mã "${code}" không thuộc shop hiện tại`)
  }
}

export function assertDiscountScopeForPreview(params: {
  discount: Pick<DiscountPolicyDiscount, 'scope' | 'shopId'>
  shopId?: number
}) {
  const { discount, shopId } = params

  if (discount.scope === 'SHOP') {
    if (!shopId) {
      throw new BadRequestException('Cần truyền shopId khi preview voucher của shop')
    }

    if (discount.shopId !== shopId) {
      throw new BadRequestException('Mã không thuộc shop hiện tại')
    }
  }
}

export function assertDiscountEligibility(params: {
  discount: Pick<
    DiscountPolicyDiscount,
    'startDate' | 'endDate' | 'maxTotalUses' | 'useCount' | 'maxUsesPerUser' | 'minOrderValue'
  >
  orderValue: number
  userUsage: number
  now?: Date
  code?: string
}) {
  const { discount, orderValue, userUsage, now = new Date(), code } = params
  const codePrefix = code ? `Mã "${code}"` : 'Mã'

  if (now < discount.startDate || now > discount.endDate) {
    throw new BadRequestException(`${codePrefix} chưa bắt đầu hoặc đã hết hạn`)
  }

  if (discount.maxTotalUses > 0 && discount.useCount >= discount.maxTotalUses) {
    throw new BadRequestException(`${codePrefix} đã hết lượt sử dụng`)
  }

  if (discount.maxUsesPerUser > 0 && userUsage >= discount.maxUsesPerUser) {
    if (code) {
      throw new BadRequestException(`Bạn đã dùng hết lượt mã "${code}"`)
    }
    throw new BadRequestException('Bạn đã dùng hết lượt mã này')
  }

  if (orderValue < discount.minOrderValue) {
    if (code) {
      throw new BadRequestException(`Đơn hàng tối thiểu phải từ ${discount.minOrderValue} để dùng mã "${code}"`)
    }
    throw new BadRequestException(`Đơn hàng tối thiểu phải từ ${discount.minOrderValue}`)
  }
}

export function evaluateDiscountPolicy(params: {
  discount: Pick<DiscountPolicyDiscount, 'type' | 'applyTo' | 'value' | 'maxDiscountValue' | 'products' | 'categories'>
  items: DiscountPolicyItem[]
  shippingFee: number
  code?: string
}): {
  discountAmount: number
  shippingDiscount: number
  applicableAmount: number
  orderValue: number
} {
  const { discount, items, shippingFee, code } = params
  const orderValue = getOrderValue(items)
  const maxCap = discount.maxDiscountValue ?? 0

  if (discount.type === 'SHIPPING') {
    if (shippingFee <= 0) {
      throw new BadRequestException('Đơn hàng không có phí vận chuyển để áp dụng mã freeship')
    }

    let shippingDiscount = 0
    if (discount.value >= 100) {
      shippingDiscount = shippingFee
    } else {
      shippingDiscount = (shippingFee * discount.value) / 100
    }

    if (maxCap > 0) {
      shippingDiscount = Math.min(shippingDiscount, maxCap)
    }

    shippingDiscount = Math.round(Math.min(shippingDiscount, shippingFee))

    return {
      discountAmount: 0,
      shippingDiscount,
      applicableAmount: 0,
      orderValue,
    }
  }

  let applicableAmount = 0

  if (discount.applyTo === 'ALL') {
    applicableAmount = orderValue
  } else {
    const validProductIds = discount.products.map((p) => p.productId)
    const validCategoryIds = discount.categories.map((c) => c.categoryId)

    for (const item of items) {
      const isProductValid = validProductIds.includes(item.productId)
      const isCategoryValid = item.categoryIds.some((categoryId) => validCategoryIds.includes(categoryId))

      if (isProductValid || isCategoryValid) {
        applicableAmount += item.price * item.quantity
      }
    }
  }

  if (applicableAmount === 0) {
    if (code) {
      throw new BadRequestException(`Mã "${code}" không áp dụng cho sản phẩm nào trong đơn hàng`)
    }
    throw new BadRequestException('Mã không áp dụng cho sản phẩm nào trong giỏ hàng')
  }

  let discountAmount = 0

  if (discount.type === 'FIXED_AMOUNT' || discount.type === 'COIN_CASHBACK') {
    discountAmount = discount.value
  } else if (discount.type === 'PERCENTAGE') {
    discountAmount = (applicableAmount * discount.value) / 100

    if (maxCap > 0) {
      discountAmount = Math.min(discountAmount, maxCap)
    }
  }

  discountAmount = Math.round(Math.min(discountAmount, orderValue))

  return {
    discountAmount,
    shippingDiscount: 0,
    applicableAmount,
    orderValue,
  }
}
