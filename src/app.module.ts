import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import config from './config/config';
import { TokenModule } from './modules/token/token.module';
import { SharedModule } from './modules/shared/shared.module';
import { UserModule } from './modules/user/user.module';
import { PickupPointModule } from './modules/pickupPoint/pickupPoint.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { CategoryModule } from './modules/category/category.module';
import { JwtStrategy } from './config/jwt.strategy';
import { ProductModule } from './modules/products/product.module';
import { MediaModule } from './modules/media/media.module';
import { AcceptLanguageResolver, I18nModule } from 'nestjs-i18n';
import * as path from 'path';

@Module({
  imports: [
    MongooseModule.forRoot(config.urlDB),
    SharedModule,
    PassportModule,
    JwtModule.register({
      secret: config.passportSecret,
      signOptions: { expiresIn: '1d' },
    }),
    TokenModule,
    UserModule,
    PickupPointModule,
    CategoryModule,
    ProductModule,
    MediaModule,
    I18nModule.forRoot({
      fallbackLanguage: 'ru',
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
        watch: true,
      },
      resolvers: [AcceptLanguageResolver],
    }),
  ],
  controllers: [],
  providers: [JwtStrategy],
})
export class AppModule { }
