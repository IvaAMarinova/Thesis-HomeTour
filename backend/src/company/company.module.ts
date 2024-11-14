import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Company } from './company.entity';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { FileUploadService } from '../upload/upload.service';

@Module({
  imports: [
    MikroOrmModule.forFeature([Company])
  ],
  providers: [CompanyService, FileUploadService],
  exports: [CompanyService, MikroOrmModule],
  controllers: [CompanyController],
})
export class CompanyModule {}

