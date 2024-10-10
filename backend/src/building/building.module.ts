import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Building } from './building.entity';
import { BuildingService } from './building.service';
import { BuildingController } from './building.controller';
import { CompanyModule } from '../company/company.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([Building]),
    CompanyModule,
  ],
  providers: [BuildingService],
  exports: [BuildingService],
  controllers: [BuildingController],
})
export class BuildingModule {}

