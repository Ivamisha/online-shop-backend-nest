import { Module, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductController } from './product.controller';
import { Product, ProductSchema } from './product.model';
import { Media, MediaSchema } from '../media/media.model';
import { ProductService } from './product.service';
import { UserModule } from '../user/user.module';
import { CategoryModule } from '../category/category.module';
import { MediaModule } from '../media/media.module';

@Module({
  controllers: [ProductController],
  providers: [ProductService, ConfigService],
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Media.name, schema: MediaSchema },
    ]),
    CategoryModule,
    MediaModule,
    forwardRef(() => UserModule),
  ],
  exports: [ProductService],
})
export class ProductModule {}
