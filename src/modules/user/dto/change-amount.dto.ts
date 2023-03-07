import { PickType } from '@nestjs/swagger';
import { FavoriteBodyDto } from './favorite.dto';

export class ChangeAmountDto extends PickType(FavoriteBodyDto, ['productId']) {}
