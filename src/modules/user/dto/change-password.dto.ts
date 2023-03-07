import { PickType } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';
import { UserDto } from './user.dto';

export class ChangePasswordDto extends PickType(UserDto, [
  'email',
  'password',
]) {
  @IsString()
  @MinLength(6)
  oldPassword: string;
}
