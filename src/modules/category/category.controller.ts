import {
  Body,
  BadRequestException,
  Controller,
  Get,
  Post,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Delete,
  Query,
  Put,
  Param,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { ConfigI } from 'src/config/config';
import { IdDto } from 'src/modules/shared/dto/id.dto';
import { CategoriesQueryDto } from 'src/modules/category/dto/categories-query.dto';
import { UpdateCategoryDto } from 'src/modules/category/dto/update-category.dto';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { FindCategoryDto } from './dto/find-categories.dto';

@Controller('categories')
export class CategoryController {
  constructor(
    private categoryService: CategoryService,
    private config: ConfigService<ConfigI>,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({}))
  async createCategory(
    @Body() createCategoryDto: CreateCategoryDto,
    @Res() res: Response,
  ) {
    try {
      const result = await this.categoryService.createCategory(
        createCategoryDto,
      );
      res.json(result);
    } catch (err) {
      res.status(400).send({ error: err.message });
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({}))
  async deleteOneCategory(@Param() query: IdDto, @Res() res: Response) {
    try {
      await this.categoryService.deleteOneCategory(query.id);
      res.json({});
    } catch (err) {
      res.status(400).send({ error: err.message });
    }
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({}))
  async editCategory(
    @Body() body: UpdateCategoryDto,
    @Param() idDto: IdDto,
    @Res() res: Response,
  ) {
    try {
      const { id } = idDto;
      const edited = await this.categoryService.editCategory(body, id);
      res.json(edited);
    } catch (err) {
      res.status(400).send({ error: err.message });
    }
  }

  @Get()
  async findAll(@Query() query: CategoriesQueryDto) {
    try {
      const result = await this.categoryService.findWithPagination(query);
      return result;
    } catch (err) {
      throw new BadRequestException({ error: err.message });
    }
  }

  @Get(':title')
  @UsePipes(new ValidationPipe({}))
  async findProduct(
    @Param() param: FindCategoryDto,
    @Query() query: CategoriesQueryDto,
  ) {
    try {
      const result = await this.categoryService.findCategory(
        param.title,
        query,
      );
      return result;
    } catch (err) {
      return { error: err.message };
    }
  }
}
