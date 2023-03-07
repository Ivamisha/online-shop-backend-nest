import { PickType } from '@nestjs/swagger';
import { UserDto } from 'src/modules/user/dto/user.dto';

export class UserEmailDto extends PickType(UserDto, ['email']) {}
