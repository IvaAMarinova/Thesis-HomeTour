import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { Building } from './building.entity';
import { Company } from '../company/company.entity';

@Injectable()
export class BuildingService {
  constructor(
    @InjectRepository(Building)
    private readonly buildingRepository: EntityRepository<Building>,
    @InjectRepository(Company)
    private readonly companyRepository: EntityRepository<Company>,
    private readonly em: EntityManager,
  ) {}

  async create(name: string, address: Record<string, any>, companyId: string): Promise<Building> {
    const company = await this.companyRepository.findOne({ id: companyId });
    if (!company) {
      throw new NotFoundException(`Company with id ${companyId} not found`);
    }
    const building = new Building();
    building.name = name;
    building.address = address;
    building.company = company;
    await this.em.persistAndFlush(building);
    return building;
  }

  async update(id: string, buildingData: Partial<Building>): Promise<Building> {
    const existingBuilding = await this.buildingRepository.findOne({ id });
    if (!existingBuilding) {
      throw new NotFoundException(`Building with id ${id} not found`);
    }
    this.em.assign(existingBuilding, buildingData);
    await this.em.flush();
    return existingBuilding;
  }

  async delete(id: string): Promise<void> {
    const building = await this.buildingRepository.findOne({ id });
    if (!building) {
      throw new NotFoundException(`Building with id ${id} not found`);
    }
    await this.em.removeAndFlush(building);
  }

  async getAllBuildings(): Promise<Building[]> {
    return this.buildingRepository.findAll();
  }

  async getBuildingById(id: string): Promise<Building> {
    const building = await this.buildingRepository.findOne({ id });
    if (!building) {
      throw new NotFoundException(`Building with id ${id} not found`);
    }
    return building;
  }
}