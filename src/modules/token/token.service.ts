import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import * as jwt from 'jsonwebtoken';
import { Model } from 'mongoose';
import { ConfigI } from 'src/config/config';
import { PersonalTokenI } from 'src/modules/token/personal-token.interface';
import { Token, TokenDocument } from 'src/modules/token/token-model';
import { UNKNOWN_ERROR, VALIDATION_FAILED } from '../shared/errors';
import { TokenDto } from 'src/modules/user/dto/token.dto';

@Injectable()
export class TokenService {
  constructor(
    @InjectModel(Token.name) private tokenModel: Model<TokenDocument>,
    private config: ConfigService<ConfigI>,
  ) {}

  public async generateTokens(payload): Promise<TokenDto> {
    try {
      const accessToken = jwt.sign(payload, this.config.get('jwtAcces'), {
        expiresIn: this.config.get('accessTokenValidity'),
      });
      const refreshToken = jwt.sign(payload, this.config.get('jwtRefresh'), {
        expiresIn: this.config.get('refreshTokenValidity'),
      });
      await this.saveToken(payload._id, refreshToken);
      return { refreshToken, accessToken };
    } catch (err) {
      throw new Error(UNKNOWN_ERROR);
    }
  }

  private async saveToken(userId: string, refreshToken: string) {
    try {
      const tokenData = await this.tokenModel.findOne({ user: userId });
      if (tokenData) {
        tokenData.refreshToken = refreshToken;
        return tokenData.save();
      }
      const token = await this.tokenModel.create({
        user: userId,
        refreshToken,
      });
      return token;
    } catch (err) {
      throw new Error(UNKNOWN_ERROR);
    }
  }

  public validateRefreshToken(refreshToken: string): PersonalTokenI {
    try {
      const verified = jwt.verify(
        refreshToken,
        this.config.get('jwtRefresh'),
      ) as PersonalTokenI;
      return verified;
    } catch (err) {
      throw new Error(VALIDATION_FAILED);
    }
  }

  public async findToken(refreshToken: string) {
    try {
      const tokenDate = await this.tokenModel.findOne({ refreshToken });
      return tokenDate;
    } catch (err) {
      throw new Error(UNKNOWN_ERROR);
    }
  }

  public async removeToken(refreshToken: string) {
    try {
      const tokenData = await this.tokenModel.deleteOne({
        refreshToken,
      });
      return tokenData;
    } catch (err) {
      throw new Error(UNKNOWN_ERROR);
    }
  }

  public comparePasswords(passwordFirst: string, passwordSecond: string) {
    try {
      const validPassword = bcrypt.compareSync(passwordFirst, passwordSecond);

      return validPassword;
    } catch (err) {
      throw new Error(UNKNOWN_ERROR);
    }
  }

  public getEncryptedHash(password: string): string {
    try {
      const hash = bcrypt.hashSync(password, this.config.get('HASH_ROUDS'));
      return hash;
    } catch (err) {
      throw new Error(UNKNOWN_ERROR);
    }
  }
}
