import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { PropertyService } from './property.service';
import { PropertyEntity } from './property.entity';
import { FileUploadService } from '../upload/upload.service';
import { TransformedPropertyDto } from './dto/property-transformed-response.dto';
import { PropertyInputDto } from './dto/property-input.dto';
import { JwtAuthGuard } from './../auth/guards/jwt-auth.guard'; 

@Controller('properties')
export class PropertyController {
  constructor(
    private readonly propertyService: PropertyService,
    private readonly fileUploadService: FileUploadService
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createProperty(@Body() body: PropertyInputDto): Promise<TransformedPropertyDto> {
    const property = await this.propertyService.create(body);
    return await this.mapPresignedUrlsToProperty(property);
  }

  @Get('addresses')
  async getAllAddresses(): Promise<Record<string, string>[]> {
    return this.propertyService.getAllAddresses();
  }

  @Get('/floors')
  async getAllFloors(): Promise<number[]> {
    return this.propertyService.getAllFloors();
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateProperty(@Param('id') id: string, @Body() body: Partial<PropertyInputDto>): Promise<TransformedPropertyDto> {
      try {
          const property = await this.propertyService.update(id, body);
          return this.mapPresignedUrlsToProperty(property);
      } catch (error) {
          throw error;
      }
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteProperty(@Param('id') id: string): Promise<{ message: string }> {
    try {
      await this.propertyService.delete(id);
      return { message: 'Property deleted successfully' };
    } catch (error) {
      throw error;
    }
  }

  @Get()
  async getAllProperties(): Promise<TransformedPropertyDto[]> {
    const properties = await this.propertyService.getAllProperties();

    const mappedProperties = await Promise.all(
      properties.map((property) => this.mapPresignedUrlsToProperty(property))
    );

    return mappedProperties;
  }

  @Get(':id')
  async getPropertyById(@Param('id') id: string): Promise<TransformedPropertyDto> {
    const property = await this.propertyService.getPropertyById(id);
    if (!property) return null;
    return this.mapPresignedUrlsToProperty(property);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('all')
  async deleteAllProperties(): Promise<{ message: string }> {
      try {
          await this.propertyService.deleteAllProperties();
          return { message: 'All properties deleted successfully' };
      } catch (error) {
          throw error;
      }
  }

  async mapPresignedUrlsToProperty(property: PropertyEntity): Promise<TransformedPropertyDto> {
    const headerImage = property.resources?.headerImage
      ? {
          key: property.resources.headerImage,
          url: await this.fileUploadService.getPreSignedURLToViewObject(property.resources.headerImage),
        }
      : null;
  
    const galleryImages = property.resources?.galleryImages
      ? await Promise.all(
          property.resources.galleryImages.map(async (imageKey) => ({
            key: imageKey,
            url: await this.fileUploadService.getPreSignedURLToViewObject(imageKey),
          }))
        )
      : [];
  
    const transformedResources = {
      headerImage,
      galleryImages,
      visualizationFolder: property.resources?.visualizationFolder || null,
    };
  
    return new TransformedPropertyDto({
      id: property.id,
      name: property.name,
      description: property.description,
      floor: property.floor,
      address: property.address as { street: string; city: string; neighborhood: string },
      phoneNumber: property.phoneNumber,
      email: property.email,
      company: property.company.id,
      resources: transformedResources,
    });
  }
  
  
}