import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3 } from 'aws-sdk';

@Injectable()
export class FileUploadService {
    private readonly s3: S3;
    private readonly bucketName: string;

    constructor(private readonly configService: ConfigService) {
        const region = configService.get('AWS_BUCKET_REGION');
        const accessKey = configService.get('AWS_ACCESS_KEY');
        const secretKey = configService.get('AWS_SECRET_KEY');

        if (!region || !accessKey || !secretKey) {
            throw new Error('AWS configuration is missing in environment variables.');
        }

        this.s3 = new S3({
            region,
            accessKeyId: accessKey,
            secretAccessKey: secretKey,
        });

        this.bucketName = configService.get('AWS_BUCKET_NAME');

        if (!this.bucketName) {
            throw new Error('AWS bucket name is missing in environment variables.');
        }
    }

    async getPreSignedURL(key: string, contentType: string): Promise<string> {
        try {
            const params = {
                Bucket: this.bucketName,
                Key: key,
                ContentType: contentType,
                Expires: 1800,
            };

            return await this.s3.getSignedUrlPromise('putObject', params);
        } catch (error) {
            throw new Error(`Failed to generate pre-signed URL: ${error.message}`);
        }
    }

    async getPreSignedURLToViewObject(key: string): Promise<string> {
        try {
            const params = {
                Bucket: this.bucketName,
                Key: key,
                Expires: 1800,
            };

            return await this.s3.getSignedUrlPromise('getObject', params);
        } catch (error) {
            throw new Error(`Failed to generate pre-signed URL for viewing: ${error.message}`);
        }
    }

    async deleteObject(key: string): Promise<void> {
        try {
            const params = {
                Bucket: this.bucketName,
                Key: key,
            };

            await this.s3.deleteObject(params).promise();
        } catch (error) {
            throw new Error(`Failed to delete object: ${error.message}`);
        }
    }
}