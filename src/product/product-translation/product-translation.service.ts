import { Injectable } from '@nestjs/common';
import { CreateProductTranslationDto } from './dto/create-product-translation.dto';
import { UpdateProductTranslationDto } from './dto/update-product-translation.dto';

@Injectable()
export class ProductTranslationService {
  create(createProductTranslationDto: CreateProductTranslationDto) {
    return 'This action adds a new productTranslation';
  }

  findAll() {
    return `This action returns all productTranslation`;
  }

  findOne(id: number) {
    return `This action returns a #${id} productTranslation`;
  }

  update(id: number, updateProductTranslationDto: UpdateProductTranslationDto) {
    return `This action updates a #${id} productTranslation`;
  }

  remove(id: number) {
    return `This action removes a #${id} productTranslation`;
  }
}
