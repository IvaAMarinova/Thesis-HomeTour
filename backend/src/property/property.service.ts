import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { PropertyEntity } from './property.entity';
import { Company } from '../company/company.entity';
import { Building } from '../building/building.entity';
import { UserProperty } from '../user-property/user-property.entity';

@Injectable()
export class PropertyService {
  constructor(
    @InjectRepository(PropertyEntity)
    private readonly propertyRepository: EntityRepository<PropertyEntity>,
    @InjectRepository(Company)
    private readonly companyRepository: EntityRepository<Company>,
    @InjectRepository(Building)
    private readonly buildingRepository: EntityRepository<Building>,
    private readonly em: EntityManager,
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
    },
    buildingId?: string,
  ): Promise<PropertyEntity> {
    const companyObject = await this.companyRepository.findOne({ id: companyId });
    if (!companyObject) {
      console.error(`Company with id ${companyId} not found`);
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
    if(buildingId) {
      const building = await this.buildingRepository.findOne({ id: buildingId });
      if (!building) {
        throw new NotFoundException(`Building with id ${buildingId} not found`);
      }
      property.building = building;
    }
    try {
      await this.em.persistAndFlush(property);
    } catch (error) {
      throw new Error(`Failed to create property: ${error.message}`);
    }
    return property;
  }

  async update(id: string, propertyData: Partial<PropertyEntity>): Promise<PropertyEntity> {
    const existingProperty = await this.propertyRepository.findOne({ id });
    if (!existingProperty) {
      throw new NotFoundException(`Property with id ${id} not found`);
    }
    this.em.assign(existingProperty, propertyData);
    await this.em.flush();
    return existingProperty;
  }

  async delete(id: string): Promise<void> {
    const property = await this.propertyRepository.findOne({ id });
    if (!property) {
      throw new NotFoundException(`Property with id ${id} not found`);
    }

    const userProperties = await this.em.find(UserProperty, { property: property });
    if (userProperties.length > 0) {
      await this.em.removeAndFlush(userProperties);
    }

    await this.em.removeAndFlush(property);
  }

  async getAllProperties(): Promise<PropertyEntity[]> {
    return this.propertyRepository.findAll();
  }

  async getPropertyById(id: string): Promise<PropertyEntity> {
    const property = await this.propertyRepository.findOne({ id });
    if (!property) {
      throw new NotFoundException(`Property with id ${id} not found`);
    }
    return property;
  }

  async getAllAddresses(): Promise<Record<string, string>[]> {
    const properties = await this.propertyRepository.findAll();
    return properties.map(property => property.address);;
  }

  async getAllFloors(): Promise<number[]> {
    const properties = await this.propertyRepository.findAll();
    return properties.map(property => property.floor).filter(floor => floor !== undefined);;
  }

  async getAllPropertyIds(): Promise<{ id: string }[]> {
    const properties = await this.propertyRepository.findAll({
        fields: ['id'],
    });

    console.log('[Service] Raw Properties:', properties);

    return properties.map((property) => ({ id: property.id }));
  }

  async deleteAllProperties(): Promise<void> {
    const properties = await this.propertyRepository.findAll();
    if (properties.length === 0) {
        console.log('[Service] No properties to delete.');
        return;
    }

    console.log(`[Service] Deleting ${properties.length} properties...`);

    await this.em.removeAndFlush(properties);
    console.log('[Service] All properties have been deleted.');
  }

}