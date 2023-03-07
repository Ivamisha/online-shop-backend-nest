import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Category, CategorySchema } from './category.model';
import { Product, ProductSchema } from '../products/product.model';
import { ConfigService } from '@nestjs/config';

@Module({
  controllers: [CategoryController],
  providers: [CategoryService, ConfigService],
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
  exports: [CategoryService],
})
export class CategoryModule {}
