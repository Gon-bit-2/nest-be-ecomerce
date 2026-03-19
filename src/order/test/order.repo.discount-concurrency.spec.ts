import { BadRequestException } from '@nestjs/common'
import { OrderRepo } from '../repository/order.repo'

type ApplyDiscountParams = {
  code: string
  userId: number
  orderId: number
  shopId: number
  expectedScope: 'SHOP' | 'PLATFORM'
  items: Array<{ productId: number; categoryIds: number[]; price: number; quantity: number }>
  shippingFee: number
}

type DiscountApplyPrivateApi = {
  validateAndApplyDiscount: (
    tx: unknown,
    params: ApplyDiscountParams,
  ) => Promise<{ discountAmount: number; shippingDiscount: number }>
}

describe('OrderRepo discount concurrency integration', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should allow only one successful apply when maxTotalUses is 1', async () => {
    const state = {
      useCount: 0,
      maxTotalUses: 1,
    }

    const discount = {
      id: 100,
      code: 'ONLY1',
      type: 'FIXED_AMOUNT' as const,
      scope: 'PLATFORM' as const,
      applyTo: 'ALL' as const,
      value: 10,
      maxDiscountValue: 0,
      minOrderValue: 0,
      maxTotalUses: state.maxTotalUses,
      useCount: state.useCount,
      maxUsesPerUser: 0,
      startDate: new Date(Date.now() - 60_000),
      endDate: new Date(Date.now() + 60_000),
      shopId: null,
      products: [] as Array<{ productId: number }>,
      categories: [] as Array<{ categoryId: number }>,
    }

    const tx = {
      discount: {
        findUnique: jest.fn(() => Promise.resolve({ ...discount, useCount: state.useCount })),
        updateMany: jest.fn(async () => {
          await new Promise((resolve) => setTimeout(resolve, 10))

          if (state.useCount < state.maxTotalUses) {
            state.useCount += 1
            return { count: 1 }
          }

          return { count: 0 }
        }),
      },
      discountUsage: {
        count: jest.fn(() => Promise.resolve(0)),
        create: jest.fn(() => Promise.resolve({ id: Math.random() })),
      },
      userSavedDiscount: {
        update: jest.fn(() => Promise.reject(new Error('User did not save this voucher'))),
      },
    }

    const repo = new OrderRepo({} as never, {} as never)
    const discountApi = repo as unknown as DiscountApplyPrivateApi

    const baseParams = {
      code: 'ONLY1',
      userId: 1,
      shopId: 10,
      expectedScope: 'PLATFORM' as const,
      items: [
        {
          productId: 1,
          categoryIds: [],
          price: 100,
          quantity: 1,
        },
      ],
      shippingFee: 0,
    }

    const results = await Promise.allSettled([
      discountApi.validateAndApplyDiscount(tx, { ...baseParams, orderId: 1001 }),
      discountApi.validateAndApplyDiscount(tx, { ...baseParams, orderId: 1002 }),
    ])

    const fulfilled = results.filter((result) => result.status === 'fulfilled')
    const rejected = results.filter((result) => result.status === 'rejected')

    expect(fulfilled).toHaveLength(1)
    expect(rejected).toHaveLength(1)
    expect(state.useCount).toBe(1)

    const rejectedResult = rejected[0]
    if (rejectedResult.status !== 'rejected') {
      throw new Error('Expected rejected result')
    }

    const rejectedReason = rejectedResult.reason as Error
    expect(rejectedReason).toBeInstanceOf(BadRequestException)
    expect(rejectedReason.message).toContain('đã hết lượt sử dụng')
  })
})
