/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/service/prisma.service'
import {
  CreateProductBodyType,
  GetProductDetailResType,
  GetProductsQueryType,
  GetProductsResType,
  ProductType,
  UpdateProductBodyType,
} from '../product.model'
import { ALL_LANGUAGE_CODE } from 'src/shared/constants/other.constant'
import { Prisma } from '@prisma/client'

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
    const [data, totalItems] = await Promise.all([
      this.prismaService.product.findMany({
        skip,
        take,
        where,
        include: {
          productTranslations: {
            where: languageId === ALL_LANGUAGE_CODE ? { deletedAt: null } : { deletedAt: null, languageId },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
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
    const { skus, categories, ...productData } = data
    return this.prismaService.product.create({
      data: {
        ...productData,
        createdById,
        categories: {
          connect: categories.map((category) => ({ id: category })),
        },
        skus: {
          createMany: {
            data: skus,
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
