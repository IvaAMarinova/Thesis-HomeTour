import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager } from '@mikro-orm/core';
import { Building } from './building.entity';
import { Company } from '../company/company.entity';

@Injectable()
export class BuildingService {
  constructor(
    @InjectRepository(Building)
    private readonly buildingRepository: EntityManager,
    @InjectRepository(Company)
    private readonly companyRepository: EntityManager,
    private readonly em: EntityManager,
  ) {}

  async create(name: string, address: Record<string, any>, companyId: string): Promise<Building> {
    const company = await this.companyRepository.findOne(Company, { id: companyId });
    const building = new Building();
    building.name = name;
    building.address = address;
    building.company = company;
    await this.em.persistAndFlush(building);
    return building;
  }

  async update(id: string, building: Building): Promise<Building | null> {
    const existingBuilding = await this.buildingRepository.findOne(Building, { id });
    if (!existingBuilding) {
      return null;
    }
    existingBuilding.name = building.name;
    existingBuilding.address = building.address;
    existingBuilding.company = building.company;
    await this.em.persistAndFlush(existingBuilding);
    return existingBuilding;
  }

  async delete(id: string): Promise<void> {
    const building = await this.buildingRepository.findOne(Building, { id });
    if (building) {
      await this.buildingRepository.removeAndFlush(building);
    } else {
      throw new NotFoundException('Building not found');
    }
  }

  async getAllBuildings(): Promise<Building[]> {
    return this.buildingRepository.findAll(Building);
  }

  async getBuildingById(id: string): Promise<Building | null> {
    return this.buildingRepository.findOne(Building, { id });
  }
}