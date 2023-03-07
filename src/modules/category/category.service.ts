import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { ConfigI } from 'src/config/config';
import { ReferenceCategoryDto } from 'src/modules/category/dto/reference-category.dto';
import {
  CATEGORY_EXIST,
  CATEGORY_NAME_IS_TOO_SHORT,
  UNKNOWN_ERROR,
} from '../shared/errors';
import { Category, CategoryDocument } from './category.model';
import { CategoriesQueryDto } from './dto/categories-query.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    private config: ConfigService<ConfigI>,
  ) {}

  async createCategory(createCategoryDto: CreateCategoryDto) {
    const candidate = await this.categoryModel
      .findOne({ title: new RegExp(createCategoryDto.title, 'i') })
      .lean();

    if (candidate) {
      throw new Error(CATEGORY_EXIST);
    }

    try {
      createCategoryDto.title =
        createCategoryDto.title[0].toUpperCase() +
        createCategoryDto.title.slice(1);

      const category = await this.categoryModel.create(createCategoryDto);

      return new ReferenceCategoryDto(category);
    } catch (error) {
      throw new Error(UNKNOWN_ERROR);
    }
  }

  async deleteOneCategory(id: string) {
    await this.categoryModel.deleteOne({ _id: id });
  }

  async editCategory(updateCategoryDto: UpdateCategoryDto, id: string) {
    try {
      const dirtyCount = await this.categoryModel.findByIdAndUpdate(
        { _id: id },
        { $set: updateCategoryDto },
        { returnDocument: 'after' },
      );

      return new ReferenceCategoryDto(dirtyCount);
    } catch (error) {
      throw new Error(UNKNOWN_ERROR);
    }
  }

  async findWithPagination(query: CategoriesQueryDto) {
    const limit = query.limit || this.config.get('categoryLimit');
    const page = query.page || this.config.get('initialPage');
    const offset = page > 1 ? (page - 1) * limit : 0;
    const { sortWay, field } = query;
    const condition = {};

    Object.keys(query).forEach((key) => {
      if (key !== 'limit' && key !== 'page') {
        condition[key] = query[key];
      }
    });

    const amount = await this.categoryModel.count(condition).lean();

    const dirtyArray = await this.categoryModel
      .find(condition)
      .sort(sortWay && field ? { [field]: sortWay } : { title: 1 })
      .limit(limit)
      .skip(offset);

    const categories = dirtyArray.map(
      (category) => new ReferenceCategoryDto(category),
    );

    return { categories, amount };
  }
  async findCategoryById(id: string) {
    try {
      const category = await this.categoryModel.findOne({ _id: id });
      return new ReferenceCategoryDto(category);
    } catch (error) {
      throw new Error(UNKNOWN_ERROR);
    }
  }

  async findCategory(title: string, query) {
    const { field, sortWay } = query;
    if (title.length < 3) {
      throw new Error(CATEGORY_NAME_IS_TOO_SHORT);
    }
    title = title[0].toUpperCase() + title.slice(1);

    const limit = this.config.get('limitFindProduct');

    const amount = await this.categoryModel
      .find({ title: { $regex: title } })
      .count()
      .lean();

    const dirtyArray = await this.categoryModel
      .find({ title: { $regex: `${title}` } })
      .sort(sortWay && field ? { [field]: sortWay } : { title: 1 })
      .limit(limit);

    const categories = dirtyArray.map(
      (category) => new ReferenceCategoryDto(category),
    );

    return { categories, amount };
  }
}
