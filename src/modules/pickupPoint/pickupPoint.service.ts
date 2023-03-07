import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigI } from 'src/config/config';
import {
  ADDRESS_IS_TOO_SHORT,
  INVALID_COORDINATE_POSITION,
  UNKNOWN_ERROR,
} from '../shared/errors';
import { PickupPointQueryDto } from './dto/pickup-point-query.dto';
import { ReferenceMetricsDto } from './dto/reference-metrics.dto';
import { ReferencePickupPointDto } from './dto/reference-pickup-point.dto';
import { UpdatePickupPointDto } from './dto/update-pickUp-point.dto';
import { PickupPoint, PickupPointDocument } from './pickupPoint.model';

@Injectable()
export class PickUpPointService {
  constructor(
    @InjectModel(PickupPoint.name)
    private pickupModel: Model<PickupPointDocument>,
    private config: ConfigService<ConfigI>,
  ) {}

  async createPickupPoint(body: PickupPoint) {
    try {
      const pickupPoint = await this.pickupModel
        .findOne({
          coordinates: body.coordinates,
        })
        .lean();

      if (pickupPoint) {
        throw new Error(INVALID_COORDINATE_POSITION);
      }

      body.address = body.address[0].toUpperCase() + body.address.slice(1);
      const result = await this.pickupModel.create(body);
      const referenceResult = new ReferencePickupPointDto(result);
      return referenceResult;
    } catch (err) {
      return { error: err.message };
    }
  }

  async getPickupPoint(query: PickupPointQueryDto) {
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

    const dirtyArray = await this.pickupModel
      .find(condition)
      .sort(sortWay && field ? { [field]: sortWay } : { address: 1 })
      .limit(limit)
      .skip(offset);

    const amount = await this.pickupModel.count(condition).lean();
    const metrics = await this.pickupModel
      .find({})
      .select('coordinates description shown _id');

    const metricsArray = metrics.map(
      (element) => new ReferenceMetricsDto(element),
    );

    const pickUpPoints = dirtyArray.map(
      (pickupPoint) => new ReferencePickupPointDto(pickupPoint),
    );
    return { pickUpPoints, amount, metricsArray };
  }

  async editPickupPoint(
    body: UpdatePickupPointDto,
    id: string,
    visibility: boolean,
  ) {
    if (visibility !== undefined) {
      try {
        const result = await this.pickupModel.findOneAndUpdate(
          { _id: id },
          { shown: visibility },
          { new: true },
        );
        return new ReferencePickupPointDto(result);
      } catch (error) {
        throw new Error(UNKNOWN_ERROR);
      }
    }

    try {
      const pickupPoint = await this.pickupModel.findOne({
        coordinates: body.coordinates,
      });
      if (pickupPoint && pickupPoint.id !== id) {
        throw new Error(INVALID_COORDINATE_POSITION);
      }
      body.address = body.address[0].toUpperCase() + body.address.slice(1);
      const result = await this.pickupModel.findByIdAndUpdate(
        { _id: id },
        { $set: body },
        { returnDocument: 'after' },
      );
      return new ReferencePickupPointDto(result);
    } catch (err) {
      return { error: err.message };
    }
  }

  async findPickupPoint(address: string, query) {
    const { field, sortWay } = query;

    if (address.length < 3) {
      throw new Error(ADDRESS_IS_TOO_SHORT);
    }

    address = address[0].toUpperCase() + address.slice(1);

    const limit = this.config.get('limitFindProduct');

    const amount = await this.pickupModel
      .find({ address: { $regex: address } })
      .count()
      .lean();

    const dirtyArray = await this.pickupModel
      .find({ address: { $regex: `${address}` } })
      .sort(sortWay && field ? { [field]: sortWay } : { address: 1 })
      .limit(limit);

    const pickUpPoints = dirtyArray.map(
      (pickUpPoint) => new ReferencePickupPointDto(pickUpPoint),
    );

    return { pickUpPoints, amount };
  }
}
