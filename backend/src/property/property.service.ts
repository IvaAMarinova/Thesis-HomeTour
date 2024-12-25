import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { PropertyEntity } from './property.entity';
import { Company } from '../company/company.entity';
import { UserProperty } from '../user-property/user-property.entity';
import { isUUID } from 'class-validator';
import { FileUploadService } from 'src/upload/upload.service';

@Injectable()
export class PropertyService {
  constructor(
    @InjectRepository(PropertyEntity)
    private readonly propertyRepository: EntityRepository<PropertyEntity>,
    @InjectRepository(Company)
    private readonly companyRepository: EntityRepository<Company>,
    private readonly em: EntityManager,
    private readonly fileUploadService: FileUploadService
  ) {}

  async create(
    address: {
      street: string;
      city: string;
      neighborhood: string;
    },
    phoneNumber: string,
    email: string,
    companyId: string,
    name: string,
    description: string,
    floor: number,
    resources: {
      headerImage: string | null;
      galleryImages: string[];
      visualizationFolder?: string | null;
    }
  ): Promise<PropertyEntity> {
    try {
      if (!isUUID(companyId)) {
        throw new BadRequestException(`Invalid UUID format for companyId: ${companyId}`);
      }

      const companyObject = await this.companyRepository.findOne({ id: companyId });
      if (!companyObject) {
        throw new NotFoundException(`Company with id ${companyId} not found`);
      }

      const property = new PropertyEntity();
      property.floor = floor;
      property.address = address;
      property.phoneNumber = phoneNumber;
      property.email = email;
      property.resources = resources;
      property.company = companyObject;
      property.name = name;
      property.description = description;

      await this.em.persistAndFlush(property);
      return property;
    } catch (error) {
      this.handleUnexpectedError(error);
    }
  }

  async update(id: string, propertyData: Partial<PropertyEntity>): Promise<PropertyEntity> {
    try {
      if (!isUUID(id)) {
        throw new BadRequestException(`Invalid UUID format for id: ${id}`);
      }

      const existingProperty = await this.propertyRepository.findOne({ id });
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

      const property = await this.propertyRepository.findOne({ id });
      if (!property) {
        throw new NotFoundException(`Property with id ${id} not found`);
      }

      const userProperties = await this.em.find(UserProperty, { property: property });
      if (userProperties.length > 0) {
        await this.em.removeAndFlush(userProperties);
      }
      await this.fileUploadService.DeleteObject(property.resources.headerImage);

      for(const image of property.resources.galleryImages) {
        await this.fileUploadService.DeleteObject(image);
      }

      await this.em.removeAndFlush(property);
    } catch (error) {
      this.handleUnexpectedError(error);
    }
  }

  async getAllProperties(): Promise<PropertyEntity[]> {
    try {
      return this.propertyRepository.findAll();
    } catch (error) {
      this.handleUnexpectedError(error);
    }
  }

  async getPropertyById(id: string): Promise<PropertyEntity> {
    try {
      if (!isUUID(id)) {
        throw new BadRequestException(`Invalid UUID format for id: ${id}`);
      }

      const property = await this.propertyRepository.findOne({ id });
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
      const properties = await this.propertyRepository.findAll();
      return properties.map((property) => property.address);
    } catch (error) {
      this.handleUnexpectedError(error);
    }
  }

  async getAllFloors(): Promise<number[]> {
    try {
      const properties = await this.propertyRepository.findAll();
      return properties
        .filter((floor) => floor !== undefined)
        .map((property) => property.floor);
    } catch (error) {
      this.handleUnexpectedError(error);
    }
  }

  async getAllPropertyIds(): Promise<{ id: string }[]> {
    try {
      const properties = await this.propertyRepository.findAll({
        fields: ['id'],
      });
      return properties.map((property) => ({ id: property.id }));
    } catch (error) {
      this.handleUnexpectedError(error);
    }
  }

  async deleteAllProperties(): Promise<void> {
    try {
      const properties = await this.propertyRepository.findAll();
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