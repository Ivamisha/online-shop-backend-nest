import { PickType } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { UserDto } from './user.dto';

export class SignInDto extends PickType(UserDto, ['email', 'password']) {
  @IsOptional()
  favorites: string[];
}
