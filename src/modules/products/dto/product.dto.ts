import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class ProductDto {
  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(60)
  @MinLength(3)
  name: string;

  @ApiProperty()
  @IsString()
  @MaxLength(90)
  @MinLength(3)
  description: string;

  @ApiProperty()
  picture: object;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  quantity: number;

  @ApiProperty()
  @IsString()
  @MinLength(3)
  category: string;

  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  shown: boolean;
}
