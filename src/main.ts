import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import config from './config/config';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      disableErrorMessages: false,
      whitelist: true,
    }),
  );
  await app.listen(config.port);
  console.info(`server started on port ${config.port}`);
}
bootstrap();
