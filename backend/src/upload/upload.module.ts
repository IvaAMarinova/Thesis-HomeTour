import { Module } from '@nestjs/common';
import { FileUploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  providers: [FileUploadService, ConfigModule],
  controllers: [UploadController],
  exports: [FileUploadService],
})
export class UploadModule {}