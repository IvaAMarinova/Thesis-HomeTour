import { Controller, Get, Query, NotFoundException, Delete } from '@nestjs/common';
import { FileUploadService } from './upload.service';

@Controller('files')
export class UploadController {
    constructor(private readonly fileUploadService: FileUploadService) { }

    @Get('to-upload')
    async getPreSignedURL(
        @Query('key') key: string,
        @Query('contentType') contentType: string,
    ) {
        if (!key) {
            throw new NotFoundException('Missing required query parameter: key');
        }
        if (!contentType) {
            throw new NotFoundException('Missing required query parameter: contentType');
        }

        try {
            const url = await this.fileUploadService.getPreSignedURL(key, contentType);
            return { url };
        } catch (error) {
            throw error;
        }
    }

    @Get('to-view')
    async getPreSignedURLToViewObject(@Query('key') key: string) {
        if (!key) {
            throw new NotFoundException('Missing required query parameter: key');
        }

        try {
            const url = await this.fileUploadService.getPreSignedURLToViewObject(key);
            return { url };
        } catch (error) {
            throw error;
        }
    }

    @Delete('delete')
    async deleteObject(@Query('key') key: string) {
        if (!key) {
            throw new NotFoundException('Missing required query parameter: key');
        }
        try {
            const url = await this.fileUploadService.DeleteObject(key);
            return { url };
        } catch (error) {
            throw error;
        }
    }
}
