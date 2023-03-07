import { IntersectionType, PartialType } from '@nestjs/swagger';
import { QueryBaseDto } from 'src/modules/shared/dto/query-base.dto';
import { PickupPoint } from './pickup-point.dto';

export class PickupPointQueryDto extends IntersectionType(
  QueryBaseDto,
  PartialType(PickupPoint),
) {}
