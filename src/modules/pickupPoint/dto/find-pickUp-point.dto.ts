import { PickType } from '@nestjs/swagger';
import { PickupPoint } from './pickup-point.dto';

export class FindPickupPointDto extends PickType(PickupPoint, ['address']) {}
