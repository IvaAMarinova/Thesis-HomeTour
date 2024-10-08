import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager } from '@mikro-orm/core';
import { PropertyEntity } from './property.enity';
import { Company } from '../company/company.entity';
import { Building } from '../building/building.entity';

@Injectable()
export class PropertyService {
  constructor(
    @InjectRepository(PropertyEntity)
    private readonly propertyRepository: EntityManager,
    private readonly companyRepository: EntityManager,
    private readonly buildingRepository: EntityManager,
    private readonly em: EntityManager,
  ) {}

  async create(
    floor: number,
    address: Record<string, string>,
    phone_number: string,
    email: string,
    resources: Record<string, any>,
    companyId: string,
    buildingId: string
  ): Promise<PropertyEntity> {
    const company = await this.companyRepository.findOne(Company, { id: companyId });
    const building = await this.buildingRepository.findOne(Building, { id: buildingId });
  
    const property = new PropertyEntity();
    property.floor = floor;
    property.address = address;
    property.phone_number = phone_number;
    property.email = email;
    property.resources = resources;
    property.company = company as Company;
    property.building = building as Building;
  
    return this.propertyRepository.create(PropertyEntity, property);
  }
  

  async update(id: string, property: PropertyEntity): Promise<PropertyEntity | null> {
    const existingProperty = await this.propertyRepository.findOne(PropertyEntity, { id });
    if (!existingProperty) {
      return null;
    }
    existingProperty.floor = property.floor;
    existingProperty.address = property.address;
    existingProperty.phone_number = property.phone_number;
    existingProperty.email = property.email;
    existingProperty.resources = property.resources;
    existingProperty.company = property.company;
    existingProperty.building = property.building;
    await this.em.persistAndFlush(existingProperty);
    return existingProperty;
  }

  async delete(id: string): Promise<void> {
    const property = await this.propertyRepository.findOne(PropertyEntity, { id });
    if (property) {
      await this.propertyRepository.removeAndFlush(property);
    }
  }

  async getAllProperties(): Promise<PropertyEntity[]> {
    return this.propertyRepository.findAll(PropertyEntity);
  }

  async getPropertyById(id: string): Promise<PropertyEntity | null> {
    return this.propertyRepository.findOne(PropertyEntity, { id });
  }

}
