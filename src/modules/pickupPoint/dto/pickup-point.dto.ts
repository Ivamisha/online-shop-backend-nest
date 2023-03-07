import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class PickupPoint {
  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(60)
  @MinLength(3)
  address: string;

  @ApiProperty()
  @IsNotEmpty()
  coordinates: [number, number];

  @ApiProperty()
  @IsString()
  @MaxLength(90)
  @MinLength(3)
  description: string;

  @ApiProperty()
  @IsString()
  @MaxLength(90)
  @MinLength(3)
  workingHours: string;

  @Transform(({ value }) => {
    return value !== 'false';
  })
  shown: boolean;
}
