import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { PropertyService } from './property.service';
import { PropertyEntity } from './property.entity';
import { FileUploadService } from '../upload/upload.service';

@Controller('properties')
export class PropertyController {
  constructor(
    private readonly propertyService: PropertyService,
    private readonly fileUploadService: FileUploadService
  ) {}

  @Post()
  async createProperty(@Body() body: {
    description: string, 
    name: string, 
    address: Record<string, string>, 
    phoneNumber: string, 
    email: string, 
    companyId: string,
    resources?: {
      headerImage?: string | null;
      galleryImages?: string[];
      visualizationFolder?: string | null;
    }, 
    floor?: number, 
    buildingId?: string
  }): Promise<PropertyEntity> {
    return this.propertyService.create(
      body.address,
      body.phoneNumber,
      body.email,
      body.companyId,
      body.name,
      body.description,
      body.floor,
      body.buildingId,
      body.resources
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
  async updateProperty(@Param('id') id: string, @Body() body: PropertyEntity): Promise<PropertyEntity | null> {
    return this.propertyService.update(id, body);
  }

  @Delete(':id')
  async deleteProperty(@Param('id') id: string): Promise<void> {
    await this.propertyService.delete(id);
  }

  @Get()
  async getAllProperties(): Promise<PropertyEntity[]> {
    const properties = await this.propertyService.getAllProperties();
    await Promise.all(properties.map(async (property) => this.mapPresignedUrlsToProperty(property)));
    return properties;
  }

  @Get(':id')
  async getPropertyById(@Param('id') id: string): Promise<PropertyEntity | null> {
    const property = await this.propertyService.getPropertyById(id);
    await this.mapPresignedUrlsToProperty(property);
    return property;
  }

  async mapPresignedUrlsToProperty(property: PropertyEntity) {
    if (property.resources?.headerImage) {
      property.resources.headerImage = await this.fileUploadService.getPreSignedURLToViewObject(
        property.resources.headerImage
      );
    }
    if (property.resources?.galleryImages) {
      property.resources.galleryImages = await Promise.all(
        property.resources.galleryImages.map(async (imageKey) => 
          this.fileUploadService.getPreSignedURLToViewObject(imageKey)
        )
      );
    }
  }
}
