import { Options, PostgreSqlDriver } from '@mikro-orm/postgresql';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';

export const getMikroOrmConfig = (configService): Options => ({
  driver: PostgreSqlDriver,
  dbName: configService.get('POSTGRES_DB'),
  host: configService.get('POSTGRES_HOST'),
  port: Number(configService.get('POSTGRES_PORT')),
  user: configService.get('POSTGRES_USER'),
  password: configService.get('POSTGRES_PASSWORD'),
  entities: ['dist/**/*.entity.js'],
  entitiesTs: ['src/**/*.entity.ts'],
  metadataProvider: TsMorphMetadataProvider,
  debug: true,
});
