import { IntersectionType, PickType } from '@nestjs/swagger';
import { CategoryDto } from 'src/modules/category/dto/category.dto';
import { QueryBaseDto } from '../../shared/dto/query-base.dto';

export class CategoriesQueryDto extends IntersectionType(
  QueryBaseDto,
  PickType(CategoryDto, ['shown']),
) {}
