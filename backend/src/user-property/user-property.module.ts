import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { UserProperty } from './user-property.entity';
import { UserPropertyService } from './user-property.service';
import { UserPropertyController } from './user-property.controller';
import { User } from '../user/user.entity';
import { PropertyEntity } from '../property/property.entity';
import { UserModule } from '../user/user.module';
import { PropertyModule } from '../property/property.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([UserProperty, User, PropertyEntity]),
    UserModule,
    PropertyModule,
  ],
  providers: [UserPropertyService],
  controllers: [UserPropertyController],
  exports: [UserPropertyService],
})
export class UserPropertyModule {}
