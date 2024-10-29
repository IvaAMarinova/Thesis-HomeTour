import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { PropertyService } from './property.service';
import { PropertyEntity } from './property.entity';

@Controller('properties')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @Post()
  async createProperty(@Body() body: {
    description: string, 
    name: string, 
    address: Record<string, string>, 
    phoneNumber: string, 
    email: string, 
    companyId: string,
    resources?: {
      header_image?: string | null;
      gallery_images?: string[];
      visualization_folder?: string | null;
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
    return this.propertyService.getAllProperties();
  }

  @Get(':id')
  async getPropertyById(@Param('id') id: string): Promise<PropertyEntity | null> {
    return this.propertyService.getPropertyById(id);
  }
}
