import { BadRequestException, NotFoundException } from '@nestjs/common'

export const NotFoundSKUException = new NotFoundException('ERROR.SKU.NotFound')
export const OutOfStockSKUException = new BadRequestException('ERROR.SKU.OutOfStock')
export const ProductNotFoundException = new NotFoundException('ERROR.Product.NotFound')
