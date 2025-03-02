import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { PropertyEntity } from './property.entity';
import { Company } from '../company/company.entity';
import { isUUID } from 'class-validator';
import { FileUploadService } from '../upload/upload.service';
import { PropertyInputDto } from './dto/property-input.dto';

@Injectable()
export class PropertyService {
  constructor(
    private readonly em: EntityManager,
    private readonly fileUploadService: FileUploadService,
  ) {}

  async create(propertyData: PropertyInputDto): Promise<PropertyEntity> {
    try {
      if (!isUUID(propertyData.company)) {
        throw new BadRequestException(`Invalid UUID format for company id`);
      }

      const companyObject = await this.em.findOne(Company, {
        id: propertyData.company,
      });
      if (!companyObject) {
        throw new NotFoundException(`Company not found`);
      }

      const property = this.em.create(PropertyEntity, propertyData);

      await this.em.persistAndFlush(property);
      return property;
    } catch (error) {
      this.handleUnexpectedError(error);
    }
  }

  async update(
    id: string,
    propertyData: Partial<PropertyInputDto>,
  ): Promise<PropertyEntity> {
    try {
      if (!isUUID(id)) {
        throw new BadRequestException(`Invalid UUID format for id`);
      }

      const existingProperty = await this.em.findOne(PropertyEntity, { id });
      if (!existingProperty) {
        throw new NotFoundException(`Property not found`);
      }

      this.em.assign(existingProperty, propertyData);
      await this.em.flush();
      return existingProperty;
    } catch (error) {
      this.handleUnexpectedError(error);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      if (!isUUID(id)) {
        throw new BadRequestException(`Invalid UUID format for id`);
      }

      const property = await this.em.findOne(PropertyEntity, { id });
      if (!property) {
        throw new NotFoundException(`Property not found`);
      }

      await this.fileUploadService.deleteObject(property.resources.headerImage);

      for (const image of property.resources.galleryImages) {
        await this.fileUploadService.deleteObject(image);
      }

      await this.em.removeAndFlush(property);
    } catch (error) {
      this.handleUnexpectedError(error);
    }
  }

  async getAllProperties(): Promise<PropertyEntity[]> {
    try {
      return this.em.findAll(PropertyEntity);
    } catch (error) {
      this.handleUnexpectedError(error);
    }
  }

  async getPropertiesByFilter(
    cities: string[],
    neighborhoods: string[],
    floorsArray?: string[],
    companiesIdsArray?: string[],
  ): Promise<PropertyEntity[]> {
    try {
      const filter: any = {};

      if (companiesIdsArray?.length > 0) {
        for (const companyId of companiesIdsArray) {
          const company = await this.em.findOne(Company, { id: companyId });
          if (company) {
            filter['company'] = company;
            break;
          }
        }
      }

      if (cities.length > 0) {
        filter['address'] = {
          ...filter['address'],
          city: { $in: cities },
        };
      }

      if (neighborhoods.length > 0) {
        filter['address'] = {
          ...filter['address'],
          neighborhood: { $in: neighborhoods },
        };
      }

      if (floorsArray?.length > 0) {
        filter['floor'] = {
          $in: floorsArray.map((floor) => parseInt(floor, 10)),
        };
      }

      const properties = await this.em.find(PropertyEntity, filter);
      return properties;
    } catch (error) {
      this.handleUnexpectedError(error);
    }
  }

  async getPropertyById(id: string): Promise<PropertyEntity> {
    try {
      if (!isUUID(id)) {
        throw new BadRequestException(`Invalid UUID format for id`);
      }

      const property = await this.em.findOne(PropertyEntity, { id });
      if (!property) {
        throw new NotFoundException(`Property not found`);
      }
      return property;
    } catch (error) {
      this.handleUnexpectedError(error);
    }
  }

  async deleteAllProperties(): Promise<void> {
    try {
      const properties = await await this.em.findAll(PropertyEntity);
      if (properties.length === 0) {
        return;
      }

      await this.em.removeAndFlush(properties);
    } catch (error) {
      this.handleUnexpectedError(error);
    }
  }

  private handleUnexpectedError(error: any): never {
    if (
      error instanceof BadRequestException ||
      error instanceof NotFoundException
    ) {
      throw error;
    }

    console.error('Unexpected error occurred:', error);
    throw new BadRequestException(
      `An unexpected error occurred: ${error.message}`,
    );
  }
}
