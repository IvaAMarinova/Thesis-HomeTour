import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from './user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { CompanyModule } from '../company/company.module';

@Module({
  imports: [MikroOrmModule.forFeature([User]), CompanyModule],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService, MikroOrmModule.forFeature([User])],
})
export class UserModule {}
