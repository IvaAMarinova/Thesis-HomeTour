import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PropertyEntity } from './property.entity';
import { PropertyService } from './property.service';
import { PropertyController } from './property.controller';
import { Company } from '../company/company.entity';
import { CompanyModule } from '../company/company.module';
import { FileUploadService } from 'src/upload/upload.service';

@Module({
  imports: [
    MikroOrmModule.forFeature([PropertyEntity, Company]),
    CompanyModule
  ],
  providers: [PropertyService, FileUploadService],
  controllers: [PropertyController],
  exports: [PropertyService, MikroOrmModule.forFeature([PropertyEntity])],
})
export class PropertyModule {}

