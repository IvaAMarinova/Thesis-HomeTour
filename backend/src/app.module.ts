import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { CompanyModule } from './company/company.module';
import { PropertyModule } from './property/property.module';
import { UserPropertyModule } from './user-property/user-property.module';
import { AuthModule } from './auth/auth.module';
import { UploadModule } from './upload/upload.module';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MikroOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        dbName: configService.get<string>('POSTGRES_DB'),
        host: configService.get<string>('POSTGRES_HOST'),
        port: configService.get<number>('POSTGRES_PORT'),
        user: configService.get<string>('POSTGRES_USER'),
        password: configService.get<string>('POSTGRES_PASSWORD'),
        entities: ['dist/**/*.entity.js'],
        entitiesTs: ['src/**/*.entity.ts'],
        metadataProvider: TsMorphMetadataProvider,
        driver: require('@mikro-orm/postgresql').PostgreSqlDriver,
        debug: true,
      }),
    }),
    UserModule,
    CompanyModule,
    PropertyModule,
    UserPropertyModule,
    AuthModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}