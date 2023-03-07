import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreatePickupPointDto } from './dto/create-pickUp-point.dto';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { AdminGuard } from '../shared/guards/admin.guard';
import { PickUpPointService } from './pickupPoint.service';
import { PickupPointQueryDto } from './dto/pickup-point-query.dto';
import { IdDto } from '../shared/dto/id.dto';
import { UpdatePickupPointDto } from './dto/update-pickUp-point.dto';
import { FindPickupPointDto } from './dto/find-pickUp-point.dto';

@Controller('pickupPoint')
export class PickUpPointController {
  constructor(private pickupPointSerivce: PickUpPointService) {}

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post()
  @UsePipes(new ValidationPipe({}))
  async createProduct(@Body() body: CreatePickupPointDto) {
    try {
      const result = await this.pickupPointSerivce.createPickupPoint(body);
      return result;
    } catch (err) {
      return { error: err.message };
    }
  }

  @Get()
  async getProductsWithParams(@Query() query: PickupPointQueryDto) {
    try {
      const result = await this.pickupPointSerivce.getPickupPoint(query);
      return result;
    } catch (err) {
      return { error: err.message };
    }
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({}))
  async editCategory(
    @Body() body: UpdatePickupPointDto,
    @Param() idDto: IdDto,
    @Query() query: PickupPointQueryDto,
  ) {
    try {
      const { id } = idDto;
      const result = await this.pickupPointSerivce.editPickupPoint(
        body,
        id,
        query.visibility,
      );
      return result;
    } catch (err) {
      return { error: err.message };
    }
  }

  @Get(':address')
  @UsePipes(new ValidationPipe({}))
  async findPickupPoint(
    @Param() param: FindPickupPointDto,
    @Query() query: PickupPointQueryDto,
  ) {
    try {
      const products = await this.pickupPointSerivce.findPickupPoint(
        param.address,
        query,
      );
      return products;
    } catch (err) {
      return { error: err.message };
    }
  }
}
