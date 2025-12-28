import { PartialType } from '@nestjs/mapped-types';
import { CreateProductTranslationDto } from './create-product-translation.dto';

export class UpdateProductTranslationDto extends PartialType(CreateProductTranslationDto) {}
