import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Building } from './building/building.entity';
import { BuildingController } from './building/building.controller';
import { BuildingService } from './building/building.service';
import { Company } from './company/company.entity';
import { CompanyController } from './company/company.controller';
import { CompanyService } from './company/company.service';
import config from 'mikro-orm.config';
import { PropertyEntity } from './property/property.enity';
import { User } from './user/user.entity';
import { UserController } from './user/user.controller';
import { UserProperty } from './user-property/user-property.entity';
import { UserPropertyService } from './user-property/user-property.service';
import { UserService } from './user/user.service';

@Module({
  imports: [
    MikroOrmModule.forRoot(config),
    MikroOrmModule.forFeature([User, Company, Building, UserProperty, PropertyEntity]),
  ],
  controllers: [AppController, UserController, CompanyController, BuildingController],
  providers: [AppService, UserService, CompanyService, BuildingService, UserPropertyService],
})
export class AppModule {}
