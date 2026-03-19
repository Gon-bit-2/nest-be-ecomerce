import { BadRequestException } from '@nestjs/common'
import { assertDiscountScopeForApply, evaluateDiscountPolicy, getOrderValue } from './discount-policy.engine'

describe('DiscountPolicyEngine matrix', () => {
  it('should compute ALL applyTo over full order value', () => {
    const items = [
      { productId: 1, categoryIds: [10], price: 100, quantity: 2 },
      { productId: 2, categoryIds: [20], price: 50, quantity: 1 },
    ]

    const result = evaluateDiscountPolicy({
      discount: {
        type: 'PERCENTAGE',
        applyTo: 'ALL',
        value: 10,
        maxDiscountValue: 0,
        products: [],
        categories: [],
      },
      items,
      shippingFee: 0,
    })

    expect(getOrderValue(items)).toBe(250)
    expect(result.applicableAmount).toBe(250)
    expect(result.discountAmount).toBe(25)
    expect(result.shippingDiscount).toBe(0)
  })

  it('should compute SPECIFIC applyTo only on matching products/categories', () => {
    const items = [
      { productId: 1, categoryIds: [10], price: 100, quantity: 1 },
      { productId: 2, categoryIds: [99], price: 200, quantity: 1 },
      { productId: 3, categoryIds: [30], price: 300, quantity: 1 },
    ]

    const result = evaluateDiscountPolicy({
      discount: {
        type: 'PERCENTAGE',
        applyTo: 'SPECIFIC',
        value: 10,
        maxDiscountValue: 0,
        products: [{ productId: 2 }],
        categories: [{ categoryId: 30 }],
      },
      items,
      shippingFee: 0,
    })

    expect(result.applicableAmount).toBe(500)
    expect(result.discountAmount).toBe(50)
  })

  it('should cap SHIPPING discount by maxDiscountValue', () => {
    const result = evaluateDiscountPolicy({
      discount: {
        type: 'SHIPPING',
        applyTo: 'ALL',
        value: 100,
        maxDiscountValue: 30,
        products: [],
        categories: [],
      },
      items: [{ productId: 1, categoryIds: [], price: 100, quantity: 1 }],
      shippingFee: 80,
    })

    expect(result.shippingDiscount).toBe(30)
    expect(result.discountAmount).toBe(0)
  })

  it('should cap PERCENTAGE discount by maxDiscountValue', () => {
    const result = evaluateDiscountPolicy({
      discount: {
        type: 'PERCENTAGE',
        applyTo: 'ALL',
        value: 50,
        maxDiscountValue: 100,
        products: [],
        categories: [],
      },
      items: [{ productId: 1, categoryIds: [], price: 500, quantity: 1 }],
      shippingFee: 0,
    })

    expect(result.discountAmount).toBe(100)
  })

  it('should throw on scope mismatch', () => {
    expect(() => {
      assertDiscountScopeForApply({
        discount: { scope: 'SHOP', shopId: 999 },
        expectedScope: 'PLATFORM',
        shopId: 1,
        code: 'X',
      })
    }).toThrow(BadRequestException)
  })
})
