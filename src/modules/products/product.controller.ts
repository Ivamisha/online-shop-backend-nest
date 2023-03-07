import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateProductDto } from 'src/modules/products/dto/create-product.dto';
import { FindProductDto } from 'src/modules/products/dto/find-product.dto';
import { ProductQueryDto } from 'src/modules/products/dto/product-query.dto';
import { IdDto } from 'src/modules/shared/dto/id.dto';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { ProductService } from './product.service';
import { saveImageToStorage } from 'src/helpers/image-storage';
import { UpdateProductDto } from './dto/update-product.dto';
import { AdminGuard } from '../shared/guards/admin.guard';
import { UserService } from '../user/user.service';

@Controller('products')
export class ProductController {
  constructor(
    private productService: ProductService,
    private userService: UserService,
  ) {}

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post()
  @UseInterceptors(FileInterceptor('file', saveImageToStorage))
  @UsePipes(new ValidationPipe({}))
  async createProduct(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreateProductDto,
  ) {
    try {
      const result = await this.productService.createProduct(file, body);
      return result;
    } catch (err) {
      return { error: err.message };
    }
  }

  @Get()
  async getProductsWithParams(@Query() query: ProductQueryDto) {
    try {
      const result = await this.productService.getProductsWithCondition(query);
      return result;
    } catch (err) {
      return { error: err.message };
    }
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Put(':id')
  @UseInterceptors(FileInterceptor('file', saveImageToStorage))
  @UsePipes(new ValidationPipe({}))
  async editProduct(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UpdateProductDto,
    @Param() param: IdDto,
    @Query() query: ProductQueryDto,
  ) {
    try {
      const result = await this.productService.editOneProduct(
        body,
        param.id,
        query.visibility,
        file,
      );
      return result;
    } catch (err) {
      return { error: err.message };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('cart')
  async getAllProductFromCart(@Req() req) {
    try {
      const user = await this.userService.findById(req.user.userId);
      const result = await this.productService.getAllProductFromCart(user);
      return result;
    } catch (err) {
      return { error: err.message };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('favorite')
  async getAllProductFromFavorite(@Req() req) {
    try {
      const user = await this.userService.findById(req.user.userId);
      const result = await this.productService.getAllProductFromFavorite(user);
      return result;
    } catch (err) {
      return { error: err.message };
    }
  }

  @Get(':name')
  @UsePipes(new ValidationPipe({}))
  async findProduct(
    @Param() param: FindProductDto,
    @Query() query: ProductQueryDto,
  ) {
    try {
      const products = await this.productService.findProduct(param.name, query);
      return products;
    } catch (err) {
      return { error: err.message };
    }
  }

  @Post('unauthorized')
  async getAllProductsFromFavoriteById(@Body() body) {
    try {
      const result = await this.productService.getAllProductsByIdArray(
        body.favoriteArray,
      );
      return result;
    } catch (err) {
      return { error: err.message };
    }
  }
}
