import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { PropertyService } from './property.service';
import { PropertyEntity } from './property.entity';
import { FileUploadService } from '../upload/upload.service';
import { TransformedPropertyDto } from './dto/property-transformed-response.dto';
import { PropertyInputDto } from './dto/property-input.dto';

@Controller('properties')
export class PropertyController {
  constructor(
    private readonly propertyService: PropertyService,
    private readonly fileUploadService: FileUploadService
  ) {}

  @Post()
  async createProperty(@Body() body: PropertyInputDto): Promise<PropertyEntity> {
    return this.propertyService.create(
      body.address,
      body.phoneNumber,
      body.email,
      body.companyId,
      body.name,
      body.description,
      body.floor,
      body.resources,
      body.buildingId
    );
  }

  @Get('addresses')
  async getAllAddresses(): Promise<Record<string, string>[]> {
    return this.propertyService.getAllAddresses();
  }

  @Get('/floors')
  async getAllFloors(): Promise<number[]> {
    return this.propertyService.getAllFloors();
  }

  @Put(':id')
  async updateProperty(@Param('id') id: string, @Body() body: PropertyInputDto): Promise<PropertyEntity | null> {
    return this.propertyService.update(id, body);
  }

  @Delete(':id')
  async deleteProperty(@Param('id') id: string): Promise<void> {
    await this.propertyService.delete(id);
  }

  @Get()
  async getAllProperties(): Promise<TransformedPropertyDto[]> {
    const properties = await this.propertyService.getAllProperties();
    return Promise.all(properties.map((property) => this.mapPresignedUrlsToProperty(property)));
  }

  @Get('ids')
  async getAllPropertyIds(): Promise<{ id: string }[]> {
      const ids = await this.propertyService.getAllPropertyIds();
      console.log('[Controller] Retrieved IDs:', ids); // Debug log
      return ids;
  }

  @Get(':id')
  async getPropertyById(@Param('id') id: string): Promise<TransformedPropertyDto | null> {
    const property = await this.propertyService.getPropertyById(id);
    if (!property) return null;
    return this.mapPresignedUrlsToProperty(property);
  }


  @Delete('all')
  async deleteAllProperties(): Promise<{ message: string }> {
      await this.propertyService.deleteAllProperties();
      return { message: 'All properties have been deleted.' };
  }

  async mapPresignedUrlsToProperty(property: PropertyEntity): Promise<TransformedPropertyDto> {
    console.log('[PropertyController] Property Data:', property);
    return {
      id: property.id,
      name: property.name,
      description: property.description,
      floor: property.floor,
      address: property.address,
      phoneNumber: property.phoneNumber,
      email: property.email,
      company: property.company.id,
      building: property.building?.id || null,
      resources: {
        ...property.resources,
        headerImage: property.resources?.headerImage
          ? {
              key: property.resources.headerImage,
              url: await this.fileUploadService.getPreSignedURLToViewObject(property.resources.headerImage),
            }
          : null,
        galleryImages: property.resources?.galleryImages
          ? await Promise.all(
              property.resources.galleryImages.map(async (imageKey) => ({
                key: imageKey,
                url: await this.fileUploadService.getPreSignedURLToViewObject(imageKey),
              }))
            )
          : [],
      },
    };
  }
}