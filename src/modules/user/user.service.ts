import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as uuid from 'uuid';
import { Model } from 'mongoose';
import { TokenService } from '../token/token.service';
import { MediaService } from '../media/media.service';
import { ReferenceUserDto } from 'src/modules/user/dto/reference-user.dto';
import { User, UserDocument } from 'src/modules/user/user.model';
import { SignInDto } from 'src/modules/user/dto/sign-in.dto';
import { UserTokenDto } from 'src/modules/user/dto/user-token.dto';
import {
  CREDENTIALS_WAS_NOT_RECOGNIZED,
  INVALID_PASSWORD,
  PRODUCT_IS_NOT_EXIST,
  UNAUTORIZED,
  UNKNOWN_ERROR,
  USER_DIDNT_FIND,
  USER_EXIST,
} from '../shared/errors';
import { SignUpDto } from 'src/modules/user/dto/sign-up.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserEmailDto } from './dto/user-email.dto';
import { MailSenderService } from '../mail/mail-sender.service';
import { I18nContext } from 'nestjs-i18n';
import { ChangeUserInfoDto } from './dto/user-change-info.dto';
import { ProductService } from '../products/product.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    private productService: ProductService,
    private tokenService: TokenService,
    private mediaService: MediaService,
    private mailSenderService: MailSenderService,
  ) {}

  async login(signInDto: SignInDto, i18n: I18nContext): Promise<UserTokenDto> {
    const user = await this.userModel
      .findOne({ email: signInDto.email })
      .lean();

    if (!user) {
      throw new Error(USER_DIDNT_FIND);
    }

    const validPassword = this.tokenService.comparePasswords(
      signInDto.password,
      user.password,
    );

    if (!validPassword) {
      await this.mailSenderService.sendUserNotice(user, i18n);
      throw new Error(INVALID_PASSWORD);
    }

    if (signInDto.favorites) {
      try {
        const repeatingArray = [].concat(signInDto.favorites, user.favorites);
        await this.productService.findProductsById(signInDto.favorites);
        const result = await this.updateFavoriteAfterAuthorized(
          user._id,
          repeatingArray,
        );
        const userDto = new ReferenceUserDto(result);
        const token = await this.tokenService.generateTokens({ ...userDto });
        return { token, user: userDto };
      } catch (error) {
        throw new Error(error.message);
      }
    }
    const userDto = new ReferenceUserDto(user);
    const token = await this.tokenService.generateTokens({ ...userDto });
    return { token, user: userDto };
  }

  async registration(signUpDto: SignUpDto): Promise<UserTokenDto> {
    const candidate = await this.userModel
      .findOne({ email: signUpDto.email })
      .lean();

    if (candidate) {
      throw new Error(USER_EXIST);
    }

    const hashPassword = this.tokenService.getEncryptedHash(signUpDto.password);
    signUpDto.password = hashPassword as string;
    const favoriteProduct = { favorites: [] };
    const shoppingCart = { shoppingCart: [] };
    const newEntity = Object.assign(
      {},
      signUpDto,
      favoriteProduct,
      shoppingCart,
    );
    const user = await this.userModel.create(newEntity);
    const userDto = new ReferenceUserDto(user);
    const token = await this.tokenService.generateTokens({ ...userDto });
    return { token, user: userDto };
  }

  async refresh(refreshToken: string): Promise<UserTokenDto> {
    if (!refreshToken) {
      throw new Error(UNAUTORIZED);
    }

    const personalToken = await this.tokenService.validateRefreshToken(
      refreshToken,
    );
    const savedToken = await this.tokenService.findToken(refreshToken);

    if (!personalToken || !savedToken) {
      throw new Error(UNAUTORIZED);
    }

    const user = await this.userModel.findById(personalToken.id);
    const userDto = new ReferenceUserDto(user);
    const token = await this.tokenService.generateTokens({ ...userDto });
    return { token, user: userDto };
  }

  async logout(refreshToken: string): Promise<void> {
    await this.tokenService.removeToken(refreshToken);
  }

  async validateUser(email: string, pass: string): Promise<UserTokenDto> {
    const user = await this.userModel.findOne({ email });
    const validPassword = this.tokenService.comparePasswords(
      pass,
      user.password,
    );

    if (!user || !validPassword) {
      throw new Error(CREDENTIALS_WAS_NOT_RECOGNIZED);
    }

    const userDto = new ReferenceUserDto(user);
    const token = await this.tokenService.generateTokens({ ...userDto });
    return { token, user: userDto };
  }

  async findOneUser(email: string): Promise<ReferenceUserDto> {
    const user = await this.userModel.findOne({ email });
    return new ReferenceUserDto(user);
  }

  async findById(id: string): Promise<ReferenceUserDto> {
    const user = await this.userModel.findById({ _id: id });
    return new ReferenceUserDto(user);
  }

  async updateUser(
    id: string,
    file: Express.Multer.File,
    body: ChangeUserInfoDto,
  ) {
    {
      const user = await this.userModel.findOne({ _id: id });
      if (!user) {
        throw new Error(USER_DIDNT_FIND);
      }

      if (user.userAvatar) {
        try {
          await this.mediaService.deleteMedia(user.userAvatar);
        } catch (error) {
          throw new BadRequestException(error.message);
        }
      }

      try {
        const image = await this.mediaService.createAndUploadMedia(
          file,
          'avatar',
        );
        const userAvatar = { userAvatar: image._id };
        body.name = body.name[0].toUpperCase() + body.name.slice(1);
        const updatedInfo = Object.assign({}, body, userAvatar);
        const result = await this.userModel.findOneAndUpdate(
          { _id: id },
          { $set: updatedInfo },
          { new: true },
        );
        return new ReferenceUserDto(result);
      } catch (error) {
        throw new BadRequestException(error.message);
      }
    }
  }

  async changePassword(
    changePasswordDto: ChangePasswordDto,
  ): Promise<ReferenceUserDto> {
    const candidate = await this.userModel
      .findOne({ email: changePasswordDto.email })
      .lean();

    const validPassword = this.tokenService.comparePasswords(
      changePasswordDto.oldPassword,
      candidate.password,
    );

    if (!validPassword) {
      throw new Error(INVALID_PASSWORD);
    }

    const hashPassword = this.tokenService.getEncryptedHash(
      changePasswordDto.password,
    );
    changePasswordDto.password = hashPassword;

    const user = await this.userModel.findOneAndUpdate(
      { email: changePasswordDto.email },
      { password: changePasswordDto.password },
      { returnDocument: 'after' },
    );

    return new ReferenceUserDto(user);
  }

  async forgot(userEmailDto: UserEmailDto, i18n: I18nContext) {
    const user = await this.userModel
      .findOne({ email: userEmailDto.email })
      .lean();

    if (!user) {
      throw new Error(USER_DIDNT_FIND);
    }
    const activationToken = uuid.v4();

    await this.mailSenderService.sendUserRestore(
      user,
      `user/forgot/${activationToken}`,
      i18n,
    );

    const userDto = new ReferenceUserDto(user);
    return { user: userDto };
  }

  async addOrRemoveFavorite(userId: string, productId: string, flag: boolean) {
    try {
      await this.productService.findProductById(productId);
    } catch (err) {
      throw new Error(PRODUCT_IS_NOT_EXIST);
    }

    try {
      if (flag) {
        const result = await this.userModel.findOneAndUpdate(
          { _id: userId },
          { $push: { favorites: productId } },
          { new: true },
        );
        return new ReferenceUserDto(result);
      }

      if (!flag) {
        const result = await this.userModel.findOneAndUpdate(
          { _id: userId },
          { $pull: { favorites: productId } },
          { new: true },
        );
        return new ReferenceUserDto(result);
      }
    } catch (error) {
      throw new Error(UNKNOWN_ERROR);
    }
  }

  async updateFavoriteAfterAuthorized(userId: string, favorite: string[]) {
    try {
      return await this.userModel.findOneAndUpdate(
        { _id: userId },
        { $addToSet: { favorites: { $each: favorite } } },
        { new: true },
      );
    } catch (error) {
      throw new Error(UNKNOWN_ERROR);
    }
  }

  async addProductToShoppingCart(
    userId: string,
    productId: string,
    flag: boolean,
  ) {
    try {
      if (flag) {
        const result = await this.userModel.findOneAndUpdate(
          { _id: userId },
          {
            $push: {
              shoppingCart: { productId: productId, amount: 1 },
            },
          },
          { new: true },
        );
        return new ReferenceUserDto(result);
      }

      if (!flag) {
        const result = await this.userModel.findOneAndUpdate(
          { _id: userId },
          { $pull: { shoppingCart: { productId: productId } } },
          { new: true },
        );
        return new ReferenceUserDto(result);
      }
    } catch (error) {
      throw new Error(UNKNOWN_ERROR);
    }
  }

  async changeAmountInShoppingCart(
    userId: string,
    productId: string,
    amount: number,
  ) {
    try {
      const result = await this.userModel.findOneAndUpdate(
        { _id: userId, 'shoppingCart.productId': productId },
        {
          $set: {
            'shoppingCart.$.amount': amount,
          },
        },
        { new: true },
      );
      return new ReferenceUserDto(result);
    } catch (error) {
      throw new Error(UNKNOWN_ERROR);
    }
  }

  async clearAllhoppingCart(userId: string) {
    try {
      const result = await this.userModel.findOneAndUpdate(
        { _id: userId },
        {
          $set: { shoppingCart: [] },
        },
        { new: true },
      );
      return new ReferenceUserDto(result);
    } catch (error) {
      throw new Error(UNKNOWN_ERROR);
    }
  }

  async clearFavorite(userId: string) {
    try {
      const result = await this.userModel.findOneAndUpdate(
        { _id: userId },
        {
          $set: { favorites: [] },
        },
        { new: true },
      );
      return new ReferenceUserDto(result);
    } catch (error) {
      throw new Error(UNKNOWN_ERROR);
    }
  }
}
