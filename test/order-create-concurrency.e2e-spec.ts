import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import request from 'supertest'
import { App } from 'supertest/types'
import { NextFunction, Request, Response } from 'express'
import { OrderController } from '../src/order/order.controller'
import { OrderService } from '../src/order/order.service'
import { OrderRepo } from '../src/order/repository/order.repo'
import { PrismaService } from '../src/shared/service/prisma.service'
import { OrderProducer } from '../src/order/queue/order.producer'
import { AddressService } from '../src/address/address.service'

describe('Order create concurrency rollback (e2e)', () => {
  let app: INestApplication<App>
  let prisma: PrismaService

  const marker = `e2e-order-${Date.now()}`

  let roleId: number
  let buyerId: number
  let shopId: number
  let brandId: number
  let categoryId: number
  let productId: number
  let skuAId: number
  let skuBId: number
  let cartAId: number
  let cartBId: number
  let discountId: number
  let discountCode: string

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        OrderService,
        OrderRepo,
        PrismaService,
        {
          provide: OrderProducer,
          useValue: {
            addCancelPaymentJob: jest.fn(() => Promise.resolve()),
          },
        },
        {
          provide: AddressService,
          useValue: {
            findById: jest.fn(() => Promise.resolve(null)),
          },
        },
      ],
    }).compile()

    app = moduleFixture.createNestApplication()
    prisma = moduleFixture.get(PrismaService)

    const role = await prisma.role.create({
      data: {
        name: `${marker}-role`,
        description: 'e2e role',
        isActive: true,
      },
    })
    roleId = role.id

    const buyer = await prisma.user.create({
      data: {
        email: `${marker}-buyer@example.com`,
        name: `${marker}-buyer`,
        password: 'pwd',
        roleId,
      },
    })
    buyerId = buyer.id

    const shop = await prisma.user.create({
      data: {
        email: `${marker}-shop@example.com`,
        name: `${marker}-shop`,
        password: 'pwd',
        roleId,
      },
    })
    shopId = shop.id

    const brand = await prisma.brand.create({
      data: {
        name: `${marker}-brand`,
        logo: 'logo.png',
      },
    })
    brandId = brand.id

    const category = await prisma.category.create({
      data: {
        name: `${marker}-category`,
      },
    })
    categoryId = category.id

    const product = await prisma.product.create({
      data: {
        name: `${marker}-product`,
        basePrice: 100,
        virtualPrice: 120,
        publishedAt: new Date(Date.now() - 60_000),
        brandId,
        images: ['img.png'],
        variants: [],
        createdById: shopId,
        categories: {
          connect: [{ id: categoryId }],
        },
      },
    })
    productId = product.id

    const skuA = await prisma.sKU.create({
      data: {
        value: `${marker}-sku-a`,
        price: 100,
        stock: 10,
        image: 'sku-a.png',
        productId,
        createdById: shopId,
      },
    })
    skuAId = skuA.id

    const skuB = await prisma.sKU.create({
      data: {
        value: `${marker}-sku-b`,
        price: 100,
        stock: 10,
        image: 'sku-b.png',
        productId,
        createdById: shopId,
      },
    })
    skuBId = skuB.id

    const cartA = await prisma.cartItem.create({
      data: {
        userId: buyerId,
        skuId: skuAId,
        quantity: 1,
      },
    })
    cartAId = cartA.id

    const cartB = await prisma.cartItem.create({
      data: {
        userId: buyerId,
        skuId: skuBId,
        quantity: 1,
      },
    })
    cartBId = cartB.id

    discountCode = `${marker}-only1`
    const discount = await prisma.discount.create({
      data: {
        name: `${marker}-discount`,
        value: 20,
        maxDiscountValue: 0,
        type: 'FIXED_AMOUNT',
        scope: 'PLATFORM',
        code: discountCode,
        description: 'e2e discount',
        maxTotalUses: 1,
        applyTo: 'ALL',
        maxUsesPerUser: 0,
        minOrderValue: 0,
        isActive: true,
        startDate: new Date(Date.now() - 60_000),
        endDate: new Date(Date.now() + 86_400_000),
      },
    })
    discountId = discount.id

    app.use((req: Request, _res: Response, next: NextFunction) => {
      req.user = {
        userId: buyerId,
        roleId,
        roleName: 'USER',
        deviceId: 0,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      }
      next()
    })
    await app.init()
  })

  afterAll(async () => {
    await prisma.discountUsage.deleteMany({ where: { discountId } })
    await prisma.order.deleteMany({ where: { userId: buyerId } })
    await prisma.payment.deleteMany({ where: { order: { none: {} } } })
    await prisma.cartItem.deleteMany({ where: { userId: buyerId } })
    await prisma.discount.deleteMany({ where: { id: discountId } })
    await prisma.productSKUSnapshot.deleteMany({ where: { productName: { startsWith: marker } } })
    await prisma.sKU.deleteMany({ where: { id: { in: [skuAId, skuBId] } } })
    await prisma.product.deleteMany({ where: { id: productId } })
    await prisma.category.deleteMany({ where: { id: categoryId } })
    await prisma.brand.deleteMany({ where: { id: brandId } })
    await prisma.user.deleteMany({ where: { id: { in: [buyerId, shopId] } } })
    await prisma.role.deleteMany({ where: { id: roleId } })
    await app.close()
  })

  it('should rollback one of two parallel create-order requests when voucher maxTotalUses = 1', async () => {
    const payloadA = [
      {
        shopId,
        shippingFee: 0,
        receiver: {
          name: 'buyer',
          phone: '0900000000',
          address: 'test',
        },
        cartItemIds: [cartAId],
        platformDiscountCode: discountCode,
      },
    ]

    const payloadB = [
      {
        shopId,
        shippingFee: 0,
        receiver: {
          name: 'buyer',
          phone: '0900000000',
          address: 'test',
        },
        cartItemIds: [cartBId],
        platformDiscountCode: discountCode,
      },
    ]

    const [resA, resB] = await Promise.all([
      request(app.getHttpServer()).post('/order').send(payloadA),
      request(app.getHttpServer()).post('/order').send(payloadB),
    ])

    const successStatuses = [resA.status, resB.status].filter((status) => status >= 200 && status < 300)
    const failedStatuses = [resA.status, resB.status].filter((status) => status >= 400)

    expect(successStatuses).toHaveLength(1)
    expect(failedStatuses).toHaveLength(1)

    const usageCount = await prisma.discountUsage.count({ where: { discountId } })
    const orderCount = await prisma.order.count({ where: { userId: buyerId } })
    const updatedDiscount = await prisma.discount.findUniqueOrThrow({ where: { id: discountId } })
    const remainingCartItems = await prisma.cartItem.count({ where: { userId: buyerId } })

    expect(usageCount).toBe(1)
    expect(orderCount).toBe(1)
    expect(updatedDiscount.useCount).toBe(1)
    expect(remainingCartItems).toBe(1)
  })
})
