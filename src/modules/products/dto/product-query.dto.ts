import { IntersectionType, PartialType } from '@nestjs/swagger';
import { QueryBaseDto } from 'src/modules/shared/dto/query-base.dto';
import { ProductDto } from './product.dto';

export class ProductQueryDto extends IntersectionType(
  QueryBaseDto,
  PartialType(ProductDto),
) {}
