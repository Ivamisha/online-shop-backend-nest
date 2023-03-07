import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import { IsOptional } from 'class-validator';

export type UserDocument = User & Document;

class ShoppingCart {
  productId: string;
  amount: number;
}

@Schema({ timestamps: true })
export class User {
  @Prop()
  name: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Media' })
  @IsOptional()
  userAvatar: string;

  @Prop()
  surname: string;

  @Prop()
  phoneNumber: string;

  @Prop()
  address: string;

  @Prop({
    required: true,
    unique: true,
  })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  isActivated: boolean;

  @Prop()
  activationLink: string;

  @Prop({
    default: false,
  })
  isAdmin: boolean;

  @Prop()
  favorites: string[];

  @Prop({ type: mongoose.Schema.Types.Array })
  shoppingCart: ShoppingCart[];
}

export const UserSchema = SchemaFactory.createForClass(User);
