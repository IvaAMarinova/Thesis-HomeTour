import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { PropertyService } from './property.service';
import { TransformedPropertyDto } from './dto/property-transformed-response.dto';
import { PropertyInputDto } from './dto/property-input.dto';
import { JwtAuthGuard } from './../auth/guards/jwt-auth.guard';

@Controller('properties')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createProperty(
    @Body() body: PropertyInputDto,
  ): Promise<TransformedPropertyDto> {
    const property = await this.propertyService.create(body);
    return await this.propertyService.mapPresignedUrlsToProperty(property);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateProperty(
    @Param('id') id: string,
    @Body() body: Partial<PropertyInputDto>,
  ): Promise<TransformedPropertyDto> {
    try {
      const property = await this.propertyService.update(id, body);
      return this.propertyService.mapPresignedUrlsToProperty(property);
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
      properties.map((property) =>
        this.propertyService.mapPresignedUrlsToProperty(property),
      ),
    );

    return mappedProperties;
  }

  @Get('/filter')
  async getPropertiesByFilter(
    @Query('cities') cities: string,
    @Query('neighborhoods') neighborhoods: string,
    @Query('floor') floors: string,
    @Query('companies') companies: string,
  ): Promise<TransformedPropertyDto[]> {
    const citiesArray = cities ? cities.split(',') : [];
    const neighborhoodsArray = neighborhoods ? neighborhoods.split(',') : [];
    const floorsArray = floors ? [floors] : [];
    const companiesIdsArray = companies ? companies.split(',') : [];
    const properties = await this.propertyService.getPropertiesByFilter(
      citiesArray,
      neighborhoodsArray,
      floorsArray,
      companiesIdsArray,
    );
    const mappedProperties = await Promise.all(
      properties.map((property) =>
        this.propertyService.mapPresignedUrlsToProperty(property),
      ),
    );
    return mappedProperties;
  }

  @Get(':id')
  async getPropertyById(
    @Param('id') id: string,
  ): Promise<TransformedPropertyDto> {
    const property = await this.propertyService.getPropertyById(id);
    if (!property) return null;
    return this.propertyService.mapPresignedUrlsToProperty(property);
  }
}
