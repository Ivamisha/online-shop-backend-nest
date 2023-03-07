import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Media' })
  picture: string;

  @Prop()
  price: number;

  @Prop()
  description: string;

  @Prop()
  quantity: number;

  @Prop()
  category: string;

  @Prop({
    default: true,
  })
  shown: boolean;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
