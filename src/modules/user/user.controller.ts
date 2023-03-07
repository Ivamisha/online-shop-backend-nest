import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { ConfigI } from 'src/config/config';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserEmailDto } from './dto/user-email.dto';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { I18n, I18nContext } from 'nestjs-i18n';
import { saveImageToStorage } from 'src/helpers/image-storage';
import { FileInterceptor } from '@nestjs/platform-express';
import { ChangeUserInfoDto } from './dto/user-change-info.dto';
import { FavoriteBodyDto } from './dto/favorite.dto';
import { ChangeAmountDto } from './dto/change-amount.dto';

@Controller('users')
export class UserController {
  constructor(
    private config: ConfigService<ConfigI>,
    private userService: UserService,
  ) {}

  @Post('login')
  @UsePipes(new ValidationPipe({}))
  async login(
    @Body() signInDto: SignInDto,
    @Res() res: Response,
    @I18n() i18n: I18nContext,
  ) {
    try {
      const result = await this.userService.login(signInDto, i18n);
      res.cookie(
        'refreshToken',
        result.token.refreshToken,
        this.config.get('refreshUserToken'),
      );
      res.cookie(
        'accessToken',
        result.token.accessToken,
        this.config.get('acesUserToken'),
      );
      res.json(result.user);
    } catch (err) {
      res.status(400).send({ error: err.message });
    }
  }

  @Post('registration')
  @UsePipes(new ValidationPipe({}))
  async registration(@Body() signUpDto: SignUpDto, @Res() res: Response) {
    try {
      const createNewUser = await this.userService.registration(signUpDto);
      res.cookie(
        'refreshToken',
        createNewUser.token.refreshToken,
        this.config.get('refreshUserToken'),
      );
      res.cookie(
        'accessToken',
        createNewUser.token.accessToken,
        this.config.get('acesUserToken'),
      );
      res.json(createNewUser.user);
    } catch (err) {
      res.status(400).send({ error: err.message });
    }
  }

  @Get('logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    try {
      const refreshToken = req.cookies.refreshToken;
      await this.userService.logout(refreshToken);
      res.clearCookie('refreshToken');
      res.clearCookie('accessToken');
      return res.json({});
    } catch (err) {
      res.status(400).send({ error: err.message });
    }
  }

  @Get('refresh')
  async refresh(@Req() req: Request, @Res() res: Response) {
    try {
      const refreshToken = req.cookies.refreshToken;
      const userData = await this.userService.refresh(refreshToken);

      res.cookie(
        'refreshToken',
        userData.token.refreshToken,
        this.config.get('refreshUserToken'),
      );
      res.cookie(
        'accessToken',
        userData.token.accessToken,
        this.config.get('acesUserToken'),
      );
      return res.json(userData.user);
    } catch (err) {
      res.clearCookie('refreshToken');
      res.clearCookie('accessToken');
      res.status(400).send({ error: err.message });
    }
  }

  @Patch('password')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({}))
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Res() res: Response,
  ) {
    try {
      const edited = await this.userService.changePassword(changePasswordDto);
      res.json(edited);
    } catch (err) {
      res.status(400).send({ error: err.message });
    }
  }

  @Post('forgot')
  async forgot(
    @I18n() i18n: I18nContext,
    @Body() userEmailDto: UserEmailDto,
    @Res() res: Response,
  ) {
    try {
      await this.userService.forgot(userEmailDto, i18n);
      return res.redirect(this.config.get('RESTORE_URL'));
    } catch (err) {
      res.status(400).send({ error: err.message });
    }
  }

  @Patch('favorites')
  @UseGuards(JwtAuthGuard)
  async addToFavorites(@Body() body: FavoriteBodyDto, @Req() req) {
    try {
      return await this.userService.addOrRemoveFavorite(
        req.user.userId,
        body.productId,
        body.flag,
      );
    } catch (err) {
      return { error: err.message };
    }
  }

  @Patch('favorites/clear')
  @UseGuards(JwtAuthGuard)
  async clearFavorite(@Req() req) {
    try {
      return await this.userService.clearFavorite(req.user.userId);
    } catch (err) {
      return { error: err.message };
    }
  }

  @Patch('cart')
  @UseGuards(JwtAuthGuard)
  async addToShoppingCart(@Body() body: FavoriteBodyDto, @Req() req) {
    try {
      return await this.userService.addProductToShoppingCart(
        req.user.userId,
        body.productId,
        body.flag,
      );
    } catch (err) {
      return { error: err.message };
    }
  }

  @Patch('cart/clear')
  @UseGuards(JwtAuthGuard)
  async clearShoppingCart(@Req() req) {
    try {
      return await this.userService.clearAllhoppingCart(req.user.userId);
    } catch (err) {
      return { error: err.message };
    }
  }

  @Patch('cart/:amount')
  @UseGuards(JwtAuthGuard)
  async changeShoppingCartAmount(
    @Param('amount') amount: number,
    @Body() body: ChangeAmountDto,
    @Req() req,
  ) {
    try {
      return await this.userService.changeAmountInShoppingCart(
        req.user.userId,
        body.productId,
        amount,
      );
    } catch (err) {
      return { error: err.message };
    }
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', saveImageToStorage))
  @UsePipes(new ValidationPipe({}))
  async changeUser(
    @Req() req,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: ChangeUserInfoDto,
  ) {
    try {
      return await this.userService.updateUser(req.user.userId, file, body);
    } catch (err) {
      return { error: err.message };
    }
  }

  @Get('/:id')
  async findOneUser(@Param('id') id: string, @Res() res: Response) {
    try {
      const result = await this.userService.findById(id);
      res.json(result);
    } catch (err) {
      res.status(400).send({ error: err.message });
    }
  }
}
