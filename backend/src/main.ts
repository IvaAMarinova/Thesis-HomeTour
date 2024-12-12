import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const allowedOrigin = process.env.NODE_ENV === 'production'
    ? process.env.PROD_FRONTEND_URL
    : process.env.DEV_FRONTEND_URL;

  app.enableCors({
  	origin: allowedOrigin,
	  credentials: true
  });
  app.use(cookieParser(process.env.COOKIE_SECRET));
  await app.listen(3000, '0.0.0.0');
}
bootstrap();
