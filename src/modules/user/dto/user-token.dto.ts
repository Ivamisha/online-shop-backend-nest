import { TokenDto } from './token.dto';

export class UserTokenDto {
  token: TokenDto;
  user: { name: string; id: string };
}
