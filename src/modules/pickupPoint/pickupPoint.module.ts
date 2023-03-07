import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { PickUpPointController } from './pickupPoint.controller';
import { PickupPoint, PickupPointSchema } from './pickupPoint.model';
import { Media, MediaSchema } from '../media/media.model';
import { PickUpPointService } from './pickupPoint.service';

@Module({
  controllers: [PickUpPointController],
  providers: [PickUpPointService, ConfigService],
  imports: [
    MongooseModule.forFeature([
      { name: PickupPoint.name, schema: PickupPointSchema },
      { name: Media.name, schema: MediaSchema },
    ]),
  ],
})
export class PickupPointModule {}
