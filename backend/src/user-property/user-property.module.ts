import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { UserProperty } from './user-property.entity';
import { UserPropertyService } from './user-property.service';
import { UserPropertyController } from './user-property.controller';
import { UserModule } from '../user/user.module';
import { PropertyModule } from '../property/property.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([UserProperty]),
    UserModule,
    PropertyModule
  ],
  providers: [UserPropertyService],
  exports: [UserPropertyService],
  controllers: [UserPropertyController],
})
export class UserPropertyModule {}

