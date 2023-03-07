import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  isNumber,
  IsOptional,
  IsString,
  Max,
} from 'class-validator';

export class QueryBaseDto {
  @ApiProperty()
  @IsOptional()
  @IsInt()
  @Max(300)
  @Type(() => Number)
  limit: number;

  @ApiProperty()
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  page: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  category: string;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  shown: boolean;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  visibility: boolean;

  @ApiProperty()
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => {
    return {
      asc: 1,
      desc: -1,
    }[value];
  })
  sortWay?: 1 | -1;

  @ApiProperty()
  @IsOptional()
  @IsString()
  field: string;
}
