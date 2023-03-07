import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/modules/user/user.model';
import { TokenModule } from '../token/token.module';
import { ConfigModule } from '@nestjs/config';
import { MediaModule } from '../media/media.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { MailModule } from '../mail/mail.module';
import { Product, ProductSchema } from '../products/product.model';
import { Media, MediaSchema } from '../media/media.model';
import { ProductModule } from '../products/product.module';

@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [
    ConfigModule,
    TokenModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Media.name, schema: MediaSchema },
    ]),
    MailModule,
    MediaModule,
    ProductModule,
  ],
  exports: [UserService],
})
export class UserModule {}
