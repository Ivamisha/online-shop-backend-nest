import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  MinLength,
  IsOptional,
} from 'class-validator';

export class UserDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  userAvatar: string;

  @ApiProperty()
  @IsString()
  @MinLength(3)
  name: string;

  @ApiProperty()
  @IsString()
  @MinLength(3)
  surname: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty()
  @IsString()
  @MinLength(3)
  address: string;

  @ApiProperty()
  @IsPhoneNumber('RU')
  phoneNumber: string;

  @ApiProperty()
  @IsBoolean()
  isAdmin: boolean;

  @ApiProperty()
  favorites: string[];
}
