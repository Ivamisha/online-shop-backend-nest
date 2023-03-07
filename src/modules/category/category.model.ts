import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema({ timestamps: true })
export class Category {
  @Prop({ type: String, required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({
    default: true,
  })
  shown: boolean;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
