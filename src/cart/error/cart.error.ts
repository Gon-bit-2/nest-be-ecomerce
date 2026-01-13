import { BadRequestException, NotFoundException } from '@nestjs/common'

export const NotFoundSKUException = new NotFoundException('ERROR.SKU.NotFound')
export const OutOfStockSKUException = new BadRequestException('ERROR.SKU.OutOfStock')
export const ProductNotFoundException = new NotFoundException('ERROR.Product.NotFound')
export const NotFoundCartException = new NotFoundException('ERROR.Cart.NotFound')
export const InvalidQuantityException = new BadRequestException('ERROR.Cart.InvalidQuantity')
