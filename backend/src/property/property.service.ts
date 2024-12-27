import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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
    private readonly fileUploadService: FileUploadService
  ) {}

  async create(propertyData: PropertyInputDto): Promise<PropertyEntity> {
    try {
      if (!isUUID(propertyData.company)) {
        throw new BadRequestException(`Invalid UUID format for company: ${propertyData.company}`);
      }

      const companyObject = await this.em.findOne(Company, { id: propertyData.company });
      if (!companyObject) {
        throw new NotFoundException(`Company with id ${propertyData.company} not found`);
      }

      const property = this.em.create(PropertyEntity, propertyData);

      await this.em.persistAndFlush(property);
      return property;
    } catch (error) {
      this.handleUnexpectedError(error);
    }
  }

  async update(id: string, propertyData: Partial<PropertyInputDto>): Promise<PropertyEntity> {
    try {
      if (!isUUID(id)) {
        throw new BadRequestException(`Invalid UUID format for id: ${id}`);
      }

      const existingProperty = await this.em.findOne(PropertyEntity, { id });
      if (!existingProperty) {
        throw new NotFoundException(`Property with id ${id} not found`);
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
        throw new BadRequestException(`Invalid UUID format for id: ${id}`);
      }

      const property = await this.em.findOne(PropertyEntity, { id });
      if (!property) {
        throw new NotFoundException(`Property with id ${id} not found`);
      }

      await this.fileUploadService.deleteObject(property.resources.headerImage);

      for(const image of property.resources.galleryImages) {
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

  async getPropertyById(id: string): Promise<PropertyEntity> {
    try {
      if (!isUUID(id)) {
        throw new BadRequestException(`Invalid UUID format for id: ${id}`);
      }

      const property = await this.em.findOne(PropertyEntity, { id });
      if (!property) {
        throw new NotFoundException(`Property with id ${id} not found`);
      }
      return property;
    } catch (error) {
      this.handleUnexpectedError(error);
    }
  }

  async getAllAddresses(): Promise<Record<string, string>[]> {
    try {
      const properties = await this.em.findAll(PropertyEntity);
      return properties.map((property) => property.address);
    } catch (error) {
      this.handleUnexpectedError(error);
    }
  }

  async getAllFloors(): Promise<number[]> {
    try {
      const properties = await this.em.findAll(PropertyEntity);
      return properties
        .filter((floor) => floor !== undefined)
        .map((property) => property.floor);
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
    if (error instanceof BadRequestException || error instanceof NotFoundException) {
      throw error;
    }

    console.error('Unexpected error occurred:', error);
    throw new BadRequestException(`An unexpected error occurred: ${error.message}`);
  }
}