import { OmitType } from '@nestjs/swagger';
import { UserDto } from './user.dto';

export class ChangeUserInfoDto extends OmitType(UserDto, [
  'isAdmin',
  'password',
]) {}
