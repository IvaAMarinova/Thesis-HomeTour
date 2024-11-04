import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { Company } from './company.entity';
import { Building } from '../building/building.entity';
import { PropertyEntity } from '../property/property.entity';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: EntityRepository<Company>,
    private readonly em: EntityManager,
  ) {}

  async create(name: string, description: string, email: string, phoneNumber: string, website: string, resources?: {logo?: string | null, gallery_images?: string[]}): Promise<Company> {
    const company = new Company();
    company.name = name;
    company.description = description;
    company.email = email;
    company.phone_number = phoneNumber;
    company.website = website;
    company.resources = resources;
    
    try {
      await this.em.persistAndFlush(company);
    } catch (error) {
      throw new Error(`Failed to create company: ${error.message}`);
    }
    return company;
  }

  async update(id: string, companyData: Partial<Company>): Promise<Company> {
    const existingCompany = await this.companyRepository.findOne({ id });
    if (!existingCompany) {
      throw new NotFoundException(`Company with id ${id} not found`);
    }
    this.em.assign(existingCompany, companyData);
    await this.em.flush();
    return existingCompany;
  }

  async delete(id: string): Promise<void> {
    const company = await this.companyRepository.findOne({ id });
    if (!company) {
      throw new NotFoundException(`Company with id ${id} not found`);
    }
  
    const buildings = await this.em.find(Building, { company: company });
    for (const building of buildings) {
      building.company = null;
    }
    await this.em.flush();
  
    await this.em.removeAndFlush(company);
  }

  async getAllCompanies(): Promise<Company[]> {
    return this.companyRepository.findAll();
  }

  async getCompanyById(id: string): Promise<Company> {
    const company = await this.companyRepository.findOne({ id });
    if (!company) {
      throw new NotFoundException(`Company with id ${id} not found`);
    }
    return company;
  }

  async getallPropertiesByCompany(id: string): Promise<PropertyEntity[]> {
    const company = await this.companyRepository.findOne({ id });
    if (!company) {
      throw new NotFoundException(`Company with id ${id} not found`);
    }
    return this.em.find(PropertyEntity, { company });
  }
}
