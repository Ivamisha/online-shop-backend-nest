import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedModule } from '../shared/shared.module';
import { Token, TokenSchema } from './token-model';
import { TokenService } from './token.service';

@Module({
  providers: [TokenService],
  imports: [
    SharedModule,
    MongooseModule.forFeature([{ name: Token.name, schema: TokenSchema }]),
  ],
  exports: [TokenService],
})
export class TokenModule {}
