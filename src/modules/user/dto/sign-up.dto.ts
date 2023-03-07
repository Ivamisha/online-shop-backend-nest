import { OmitType } from '@nestjs/swagger';
import { UserDto } from './user.dto';

export class SignUpDto extends OmitType(UserDto, ['isAdmin']) {}
