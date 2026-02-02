/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/service/prisma.service'
import {
  CreateProductBodyType,
  GetProductDetailResType,
  GetProductsQueryType,
  GetProductsResType,
  UpdateProductBodyType,
} from '../product.model'
import { ALL_LANGUAGE_CODE, OrderByType, SORT_BY, SortByType } from 'src/shared/constants/other.constant'
import { Prisma } from '@prisma/client'
import { ProductType } from 'src/shared/model/shared-product.model'

@Injectable()
export class ProductRepo {
  constructor(private readonly prismaService: PrismaService) {}

  async list({
    limit,
    page,
    name,
    brandIds,
    categories,
    minPrice,
    maxPrice,
    createdById,
    isPublic,
    languageId,
    orderBy,
    sortBy,
  }: {
    limit: number
    page: number
    name?: string
    brandIds?: number[]
    categories?: number[]
    minPrice?: number
    maxPrice?: number
    createdById?: number
    isPublic?: boolean
    languageId: string
    orderBy?: OrderByType
    sortBy?: SortByType
  }): Promise<GetProductsResType> {
    const skip = (page - 1) * limit
    const take = limit
    let where: Prisma.ProductWhereInput = {
      deletedAt: null,
      createdById: createdById ? createdById : undefined,
    }
    if (isPublic === true) {
      where.publishedAt = {
        lte: new Date(),
        not: null,
      }
    } else if (isPublic === false) {
      where = {
        ...where,
        OR: [{ publishedAt: null }, { publishedAt: { gt: new Date() } }],
      }
    }
    if (name) {
      where.name = {
        contains: name,
        mode: 'insensitive',
      }
    }
    if (brandIds && brandIds.length > 0) {
      where.brandId = {
        in: brandIds,
      }
    }
    if (categories && categories.length > 0) {
      where.categories = {
        some: {
          id: {
            in: categories,
          },
        },
      }
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.basePrice = {
        gte: minPrice,
        lte: maxPrice,
      }
    }

    //Mặc đinh sort theo createdAt mới nhất

    let calculatedOrderBy: Prisma.ProductOrderByWithRelationInput | Prisma.ProductOrderByWithRelationInput[] = {
      createdAt: orderBy,
    }
    if (sortBy === SORT_BY.PRICE) {
      calculatedOrderBy = {
        basePrice: orderBy,
      }
    } else if (sortBy === SORT_BY.SALE) {
      calculatedOrderBy = {
        order: {
          _count: orderBy,
        },
      }
    }
    const [data, totalItems] = await Promise.all([
      this.prismaService.product.findMany({
        skip,
        take,
        where,
        include: {
          productTranslations: {
            where: languageId === ALL_LANGUAGE_CODE ? { deletedAt: null } : { deletedAt: null, languageId },
          },
          order: {
            where: {
              deletedAt: null,
              status: 'DELIVERED',
            },
          },
        },
        orderBy: calculatedOrderBy,
      }),
      this.prismaService.product.count({
        where,
      }),
    ])
    return {
      data,
      totalItems,
      page,
      limit,
      totalPages: Math.ceil(totalItems / limit),
    }
  }

  async search({
    q,
    page,
    limit,
    languageId,
  }: {
    q: string
    page: number
    limit: number
    languageId: string
  }): Promise<GetProductsResType> {
    const offset = (page - 1) * limit
    const searchString = `%${q}%`

    // 1. Tìm danh sách ID sản phẩm khớp với từ khóa
    // Sử dụng pg_trgm (ILIKE theo unaccent) và Full Text Search (tsvector)
    const rawIds = await this.prismaService.$queryRaw<{ id: number }[]>`
      SELECT DISTINCT p.id
      FROM "Product" p
      LEFT JOIN "ProductTranslation" pt ON p.id = pt."productId"
      LEFT JOIN "Language" l ON pt."languageId" = l.id
      WHERE
        p."deletedAt" IS NULL
        AND (
          -- Tìm kiếm unaccent (không dấu) + substring (chứa chuỗi)
          unaccent(p.name) ILIKE unaccent(${searchString})
          OR unaccent(pt.name) ILIKE unaccent(${searchString})
          -- Tìm kiếm Full Text Search (tách từ: "quần jean" -> "quần" & "jean")
          OR to_tsvector('simple', unaccent(p.name)) @@ plainto_tsquery('simple', unaccent(${q}))
          OR to_tsvector('simple', unaccent(pt.name)) @@ plainto_tsquery('simple', unaccent(${q}))
        )
      GROUP BY p.id
      LIMIT ${limit} OFFSET ${offset}
    `

    const ids = rawIds.map((item) => item.id)

    if (ids.length === 0) {
      return {
        data: [],
        totalItems: 0,
        page,
        limit,
        totalPages: 0,
      }
    }

    // 2. Đếm tổng số lượng kết quả (để phân trang)
    const countResult = await this.prismaService.$queryRaw<{ count: bigint }[]>`
      SELECT count(DISTINCT p.id) as count
      FROM "Product" p
      LEFT JOIN "ProductTranslation" pt ON p.id = pt."productId"
      WHERE
        p."deletedAt" IS NULL
        AND (
          unaccent(p.name) ILIKE unaccent(${searchString})
          OR unaccent(pt.name) ILIKE unaccent(${searchString})
          OR to_tsvector('simple', unaccent(p.name)) @@ plainto_tsquery('simple', unaccent(${q}))
          OR to_tsvector('simple', unaccent(pt.name)) @@ plainto_tsquery('simple', unaccent(${q}))
        )
    `
    const totalItems = Number(countResult[0]?.count || 0)

    // 3. Lấy dữ liệu chi tiết
    const products = await this.prismaService.product.findMany({
      where: {
        id: { in: ids },
      },
      include: {
        productTranslations: {
          where: languageId === ALL_LANGUAGE_CODE ? { deletedAt: null } : { deletedAt: null, languageId },
        },
        order: {
          where: {
            deletedAt: null,
            status: 'DELIVERED',
          },
        },
      },
    })

    // 4. Sắp xếp lại kết quả theo thứ tự ID trả về từ Raw Query (để đảm bảo độ chính xác của tìm kiếm)
    const sortedProducts = ids.map((id) => products.find((p) => p.id === id)).filter((p) => p !== undefined) as any

    return {
      data: sortedProducts,
      totalItems,
      page,
      limit,
      totalPages: Math.ceil(totalItems / limit),
    }
  }

  async findById(productId: number) {
    const product = await this.prismaService.product.findUnique({
      where: {
        id: productId,
        deletedAt: null,
      },
    })
    return product
  }

  async getDetail({
    productId,
    languageId,
    isPublic,
  }: {
    productId: number
    languageId: string
    isPublic?: boolean
  }): Promise<GetProductDetailResType | null> {
    let where: Prisma.ProductWhereUniqueInput = {
      id: productId,
      deletedAt: null,
    }
    if (isPublic === true) {
      where.publishedAt = {
        lte: new Date(),
        not: null,
      }
    } else if (isPublic === false) {
      where = {
        ...where,
        OR: [{ publishedAt: null }, { publishedAt: { gt: new Date() } }],
      }
    }
    return this.prismaService.product.findUnique({
      where,
      include: {
        productTranslations: {
          where: languageId === ALL_LANGUAGE_CODE ? { deletedAt: null } : { deletedAt: null, languageId },
        },
        skus: {
          where: {
            deletedAt: null,
          },
        },
        brand: {
          include: {
            brandTranslations: {
              where: languageId === ALL_LANGUAGE_CODE ? { deletedAt: null } : { deletedAt: null, languageId },
            },
          },
        },
        categories: {
          where: {
            deletedAt: null,
          },
          include: {
            categoryTranslations: {
              where: languageId === ALL_LANGUAGE_CODE ? { deletedAt: null } : { deletedAt: null, languageId },
            },
          },
        },
      },
    })
  }

  create({
    createdById,
    data,
  }: {
    createdById: number
    data: CreateProductBodyType
  }): Promise<GetProductDetailResType> {
    const { skus, categories, publishedAt, ...productData } = data
    return this.prismaService.product.create({
      data: {
        ...productData,
        publishedAt: publishedAt ? new Date(publishedAt) : null,
        createdById,
        categories: {
          connect: categories.map((category) => ({ id: category })),
        },
        skus: {
          createMany: {
            data: skus.map((sku) => ({
              ...sku,
              createdById,
            })),
          },
        },
      },
      include: {
        productTranslations: {
          where: {
            deletedAt: null,
          },
        },
        skus: {
          where: {
            deletedAt: null,
          },
        },
        brand: {
          include: {
            brandTranslations: {
              where: {
                deletedAt: null,
              },
            },
          },
        },
        categories: {
          where: {
            deletedAt: null,
          },
          include: {
            categoryTranslations: {
              where: {
                deletedAt: null,
              },
            },
          },
        },
      },
    })
  }

  async update({
    id,
    updatedById,
    data,
  }: {
    id: number
    updatedById: number
    data: UpdateProductBodyType
  }): Promise<ProductType> {
    const { skus: dataSkus, categories, ...productData } = data
    //SKU đã tồn tại trong db nhưng không có trong data payload thì bị xóa
    //SKU đã tồn tại trong DB nhưng có trong data payload thì được cập nhật
    //SKU không tồn tại trong DB nhưng có trong data payload thì được tạo
    //1. lấy danh sách SKU hiện tại trong DB
    const existingSKUs = await this.prismaService.sKU.findMany({
      where: {
        productId: id,
        deletedAt: null,
      },
    })
    //2. Tìm các SKU cần xóa(tồn tại trong db nhưng không có trong payload)
    const skusToDelete = existingSKUs.filter((sku) => dataSkus.every((dataSku) => dataSku.value !== sku.value))
    const skuIdsToDelete = skusToDelete.map((sku) => sku.id)

    //3.Maping Id vào trong data payload
    const skuWithId = dataSkus.map((dataSku) => {
      const existingSku = existingSKUs.find((existingSku) => existingSku.value === dataSku.value)
      if (existingSku) {
        return {
          ...dataSku,
          id: existingSku ? existingSku.id : null,
        }
      }
      return {
        ...dataSku,
        id: null,
      }
    })

    //4. Tìm các skus để cập nhập
    const skusToUpdate = skuWithId.filter((sku) => sku.id !== null)
    //5. Tìm các skus để tạo
    const skusToCreate = skuWithId
      .filter((sku) => sku.id === null)
      .map((sku) => {
        const { id: skuId, ...skuData } = sku
        return {
          ...skuData,
          productId: id,
          createdById: updatedById,
        }
      })
    const [product] = await this.prismaService.$transaction([
      //update product
      this.prismaService.product.update({
        where: {
          id,
          deletedAt: null,
        },
        data: {
          ...productData,
          publishedAt: productData.publishedAt ? new Date(productData.publishedAt) : null,
          updatedById,
          categories: {
            connect: categories.map((category) => ({ id: category })),
          },
        },
      }),
      //xóa mềm các skku không có trong data payload
      this.prismaService.sKU.updateMany({
        where: {
          id: {
            in: skuIdsToDelete,
          },
        },
        data: {
          deletedAt: new Date(),
          deletedById: updatedById,
        },
      }),

      //cập nhập sku có trong data payload
      ...skusToUpdate.map((sku) =>
        this.prismaService.sKU.update({
          where: {
            id: sku.id as number,
          },
          data: {
            value: sku.value,
            price: sku.price,
            stock: sku.stock,
            image: sku.image,
            updatedById,
          },
        }),
      ),
      //tạo mới các sku không có trong data payload
      this.prismaService.sKU.createMany({
        data: skusToCreate,
      }),
    ])
    return product
  }
  async delete({ id, deletedById }: { id: number; deletedById: number }, isHard?: boolean) {
    if (isHard) {
      const [product] = await Promise.all([
        this.prismaService.product.delete({
          where: {
            id,
          },
        }),
        this.prismaService.sKU.deleteMany({
          where: {
            productId: id,
          },
        }),
      ])
      return product
    }
    const [product] = await Promise.all([
      this.prismaService.product.update({
        where: {
          id,
          deletedAt: null,
        },
        data: {
          deletedAt: new Date(),
          deletedById,
        },
      }),
      this.prismaService.productTranslation.updateMany({
        where: {
          productId: id,
          deletedAt: null,
        },
        data: {
          deletedAt: new Date(),
          deletedById,
        },
      }),
      this.prismaService.sKU.updateMany({
        where: {
          productId: id,
          deletedAt: null,
        },
        data: {
          deletedAt: new Date(),
          deletedById,
        },
      }),
    ])
    return product
  }
}
