import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { ConfigI } from 'src/config/config';
import { Media, MediaDocument } from './media.model';
import { S3 } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MediaService {
  constructor(
    @InjectModel(Media.name)
    private mediaModel: Model<MediaDocument>,
    private config: ConfigService<ConfigI>,
  ) {}

  async createAndUploadMedia(
    file: Express.Multer.File,
    bucketFolder: 'avatar' | 'product',
  ) {
    const filePath = file.mimetype.split('/');
    const fileName = `${uuidv4()}.${filePath[1]}`;
    const body = {
      name: fileName,
      mimetype: file.mimetype,
      size: file.size,
      bucketFolder: `${bucketFolder}/${fileName}`,
    };
    const createdFile = await this.mediaModel.create(body);
    await this.upload(createdFile, file.buffer);
    return createdFile;
  }

  async getImagePath(id: ObjectId) {
    const image = await this.mediaModel.findOne({ _id: id });
    if (!image) {
      throw new BadRequestException('Could not find image');
    }

    const s3 = new S3();
    const param = {
      Bucket: this.config.get('AWS_BUCKET_NAME'),
      Key: image.bucketFolder,
    };
    const result = s3.getObject(param).createReadStream();
    return result;
  }

  async deleteMedia(id: string) {
    const image = await this.mediaModel.findOne({ _id: id });

    if (!image) {
      throw new BadRequestException('Could not find image');
    }

    const s3 = new S3();

    const param = {
      Bucket: this.config.get('AWS_BUCKET_NAME'),
      Key: image.bucketFolder,
    };

    try {
      await s3.deleteObject(param).promise();
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async upload(file, buffer: Buffer) {
    const s3 = new S3();
    const param = {
      Bucket: this.config.get('AWS_BUCKET_NAME'),
      Key: file.bucketFolder,
      Body: buffer,
    };
    return await s3.upload(param).promise();
  }
}
