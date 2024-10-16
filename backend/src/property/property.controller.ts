import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { PropertyService } from './property.service';
import { PropertyEntity } from './property.entity';

@Controller('properties')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @Post()
  async createProperty(@Body() body: {floor: number, address: Record<string, string>, phone_number: string, email: string, resources: Record<string, any>, companyId: string, buildingId?: string}): Promise<PropertyEntity> {
    return this.propertyService.create(
      body.floor,
      body.address,
      body.phone_number,
      body.email,
      body.resources,
      body.companyId,
      body.buildingId
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