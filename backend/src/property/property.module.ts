import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PropertyEntity } from './property.entity';
import { PropertyService } from './property.service';
import { PropertyController } from './property.controller';
import { CompanyModule } from '../company/company.module';
import { BuildingModule } from '../building/building.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([PropertyEntity]),
    CompanyModule,
    BuildingModule
  ],
  providers: [PropertyService],
  exports: [PropertyService],
  controllers: [PropertyController],
})
export class PropertyModule {}

