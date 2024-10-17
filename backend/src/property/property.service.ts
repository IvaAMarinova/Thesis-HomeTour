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
    floor: number,
    address: Record<string, string>,
    phone_number: string,
    email: string,
    resources: Record<string, any>,
    companyId: string,
    name: string,
    description: string,
    buildingId?: string
  ): Promise<PropertyEntity> {
    const company = await this.companyRepository.findOne({ id: companyId });
    if (!company) {
      throw new NotFoundException(`Company with id ${companyId} not found`);
    }
    

    const property = new PropertyEntity();
    property.floor = floor;
    property.address = address;
    property.phone_number = phone_number;
    property.email = email;
    property.resources = resources;
    property.company = company;
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
}
