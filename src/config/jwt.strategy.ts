import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigI } from './config';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { PersonalTokenI } from 'src/modules/token/personal-token.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private config: ConfigService<ConfigI>) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req.cookies.accessToken as string,
      ]),
      ignoreExpiration: false,
      secretRefresh: config.get('jwtRefresh'),
      secretAccess: config.get('jwtAcces'),
      secretOrKey: config.get('jwtAcces'),
    });
  }

  async validate(payload: PersonalTokenI) {
    return {
      userId: payload.id,
      username: payload.name,
      isAdmin: payload.isAdmin,
    };
  }
}
