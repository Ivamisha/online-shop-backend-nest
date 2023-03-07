import { PickType } from '@nestjs/swagger';
import { CategoryDto } from './category.dto';

export class FindCategoryDto extends PickType(CategoryDto, ['title']) {}
