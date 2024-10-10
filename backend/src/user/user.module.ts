import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './user.entity';
import { CompanyModule } from '../company/company.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([User]),
    CompanyModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
