import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MikroOrmModuleSyncOptions } from '@mikro-orm/nestjs';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { AppModule } from './src/app.module';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';

export default async (): Promise<MikroOrmModuleSyncOptions> => {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  });
  const configService = app.get(ConfigService);

  const options: MikroOrmModuleSyncOptions = {
    driver: PostgreSqlDriver,
    dbName: configService.get<string>('POSTGRES_DB'),
    host: configService.get<string>('POSTGRES_HOST'),
    port: configService.get<number>('POSTGRES_PORT'),
    user: configService.get<string>('POSTGRES_USER'),
    password: configService.get<string>('POSTGRES_PASSWORD'),
    entities: ['dist/**/*.entity.js'],
    entitiesTs: ['src/**/*.entity.ts'],
    metadataProvider: TsMorphMetadataProvider,
    debug: true,
  };

  await app.close();
  return options;
};
