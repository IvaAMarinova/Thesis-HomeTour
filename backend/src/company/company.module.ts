import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Company } from './company.entity';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';

@Module({
  imports: [
    MikroOrmModule.forFeature([Company])
  ],
  providers: [CompanyService],
  exports: [CompanyService, MikroOrmModule],
  controllers: [CompanyController],
})
export class CompanyModule {}

