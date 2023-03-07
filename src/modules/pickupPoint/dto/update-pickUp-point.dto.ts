import { PartialType } from '@nestjs/swagger';
import { PickupPoint } from './pickup-point.dto';

export class UpdatePickupPointDto extends PartialType(PickupPoint) {}
