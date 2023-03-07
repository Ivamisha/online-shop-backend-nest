import { PickType } from '@nestjs/swagger';
import { ProductDto } from './product.dto';

export class FindProductDto extends PickType(ProductDto, ['name']) {}
