import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class FavoriteBodyDto {
  @ApiProperty()
  @IsNotEmpty()
  flag: boolean;

  @IsString()
  productId: string;

  @IsNumber()
  @IsOptional()
  amount: number;
}
