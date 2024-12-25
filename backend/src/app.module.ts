import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import config from 'mikro-orm.config';
import { UserModule } from './user/user.module';
import { CompanyModule } from './company/company.module';
import { PropertyModule } from './property/property.module';
import { UserPropertyModule } from './user-property/user-property.module';
import { AuthModule } from './auth/auth.module';
import { UploadModule } from './upload/upload.module';
import { ConfigModule } from '@nestjs/config';
@Module({
  imports: [
    MikroOrmModule.forRoot(config),
    UserModule,
    CompanyModule,
    PropertyModule,
    UserPropertyModule,
    AuthModule,
    UploadModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
