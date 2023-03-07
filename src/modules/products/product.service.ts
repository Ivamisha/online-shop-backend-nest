import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigI } from 'src/config/config';
import { ReferenceProductDto } from 'src/modules/products/dto/reference-product.dto';
import { MediaService } from '../media/media.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { Product, ProductDocument } from './product.model';
import {
  MUST_BE_SPECIFIED,
  CATEGORY_IS_HIDE,
  PRODUCT_NAME_IS_TOO_SHORT,
  CANT_DELETE_PRODUCT_IMAGE,
  UNKNOWN_ERROR,
  PRODUCT_IN_FAVORITES_IS_NOT_FOUND,
} from '../shared/errors';
import { CategoryService } from '../category/category.service';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name)
    private productModel: Model<ProductDocument>,
    private categoryService: CategoryService,
    private mediaService: MediaService,
    private config: ConfigService<ConfigI>,
  ) {}

  async createProduct(file: Express.Multer.File, body: CreateProductDto) {
    const categoryDate = await this.categoryService.findCategoryById(
      body.category,
    );

    if (!categoryDate) {
      throw new Error(MUST_BE_SPECIFIED);
    }

    if (!categoryDate.shown) {
      throw new Error(CATEGORY_IS_HIDE);
    }

    try {
      const image = await this.mediaService.createAndUploadMedia(
        file,
        'product',
      );
      const picture = { picture: image._id };
      body.name = body.name[0].toUpperCase() + body.name.slice(1);
      body.category = categoryDate.title;
      const bodyWithImage = Object.assign({}, picture, body);
      const result = await this.productModel.create(bodyWithImage);
      return new ReferenceProductDto(result);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getProductsWithCondition(query: ProductQueryDto) {
    const limit = query.limit || 10;
    const page = query.page || 1;
    const offset = page > 1 ? (page - 1) * limit : 0;
    const { sortWay, field } = query;
    const condition = {};

    Object.keys(query).forEach((key) => {
      if (key !== 'limit' && key !== 'page') {
        condition[key] = query[key];
      }
    });

    const dirtyArray = await this.productModel
      .find(condition)
      .sort(sortWay && field ? { [field]: sortWay } : { name: 1 })
      .limit(limit)
      .skip(offset);

    const amount = await this.productModel.count(condition).lean();

    const products = dirtyArray.map(
      (product) => new ReferenceProductDto(product),
    );
    return { products, amount };
  }

  async findProduct(name: string, query) {
    const { field, sortWay } = query;
    if (name.length < 3) {
      throw new Error(PRODUCT_NAME_IS_TOO_SHORT);
    }
    name = name[0].toUpperCase() + name.slice(1);

    const limit = this.config.get('limitFindProduct');

    const amount = await this.productModel
      .find({ name: { $regex: name } })
      .count()
      .lean();

    const dirtyArray = await this.productModel
      .find({ name: { $regex: `${name}` } })
      .sort(sortWay && field ? { [field]: sortWay } : { name: 1 })
      .limit(limit);

    const products = dirtyArray.map(
      (product) => new ReferenceProductDto(product),
    );

    return { products, amount };
  }

  async editOneProduct(
    body: UpdateProductDto,
    id: string,
    visibility: boolean,
    file: Express.Multer.File,
  ) {
    if (visibility !== undefined) {
      const result = await this.productModel.findOneAndUpdate(
        { _id: id },
        { shown: visibility },
        { new: true },
      );
      return new ReferenceProductDto(result);
    }

    const productDate = await this.productModel.findOne({ id: id }).lean();

    if (!productDate) {
      throw new Error(MUST_BE_SPECIFIED);
    }

    try {
      const image = await this.mediaService.createAndUploadMedia(
        file,
        'product',
      );
      await this.mediaService.deleteMedia(productDate.picture);
      body.name = body.name[0].toUpperCase() + body.name.slice(1);
      const picture = { picture: image._id };
      const bodyWithImage = Object.assign({}, picture, body);
      const workingCount = await this.productModel.findOneAndUpdate(
        { _id: id },
        { $set: bodyWithImage },
        { new: true },
      );
      return new ReferenceProductDto(workingCount);
    } catch (err) {
      throw new Error(CANT_DELETE_PRODUCT_IMAGE);
    }
  }

  async findProductById(id: string) {
    try {
      return await this.productModel.findOne({ _id: id });
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async findProductsById(id: string[]) {
    try {
      const result = await this.productModel.find({ _id: id });

      if (id.length !== result.length) {
        throw new Error(PRODUCT_IN_FAVORITES_IS_NOT_FOUND);
      }

      return result;
    } catch (error) {
      throw new Error(PRODUCT_IN_FAVORITES_IS_NOT_FOUND);
    }
  }

  async getAllProductFromFavorite(user) {
    try {
      const productsArray = await this.productModel.find({
        _id: user.favorites,
      });
      const amount = await this.productModel
        .count({ _id: user.favorites })
        .lean();
      const products = productsArray.map(
        (product) => new ReferenceProductDto(product),
      );
      return { products, amount };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getAllProductFromCart(user) {
    try {
      const productsId = user.shoppingCart.map((element) => element.productId);
      const productsArray = await this.productModel.find({ _id: productsId });
      const amount = await this.productModel.count({ _id: productsId }).lean();
      const products = productsArray.map(
        (product) => new ReferenceProductDto(product),
      );
      return { products, amount };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getAllProductsByIdArray(id: string[]) {
    try {
      const productsArray = await this.productModel.find({
        _id: id,
      });
      const amount = await this.productModel.count({ _id: id }).lean();
      const products = productsArray.map(
        (product) => new ReferenceProductDto(product),
      );
      return { products, amount };
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
