import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type PickupPointDocument = PickupPoint & Document;

@Schema({ timestamps: true })
export class PickupPoint {
  @Prop({ type: String, required: true })
  address: string;

  @Prop()
  coordinates: [number, number];

  @Prop()
  description: string;

  @Prop()
  workingHours: string;

  @Prop({
    default: true,
  })
  shown: boolean;
}

export const PickupPointSchema = SchemaFactory.createForClass(PickupPoint);
