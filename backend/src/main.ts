import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const allowedOrigin =
    configService.get<string>('NODE_ENV') === 'production'
      ? configService.get<string>('PROD_FRONTEND_URL')
      : configService.get<string>('DEV_FRONTEND_URL');

    app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      skipMissingProperties: false,
    }),
  );

  app.enableCors({
    origin: allowedOrigin,
    credentials: true
  });

  const cookieSecret = configService.get<string>('COOKIE_SECRET');
  app.use(cookieParser(cookieSecret));

  await app.listen(3000, '0.0.0.0');
}
bootstrap();