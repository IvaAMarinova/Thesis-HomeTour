import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { Company } from './company.entity';
import { Building } from '../building/building.entity';
import { PropertyEntity } from '../property/property.entity';
import { isUUID } from 'class-validator';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: EntityRepository<Company>,
    private readonly em: EntityManager,
  ) {}

  async create(
    name: string,
    description: string,
    email: string,
    phoneNumber: string,
    website: string,
    resources: { logoImage: string | null; galleryImage: string },
  ): Promise<Company> {
    const company = new Company();
    company.name = name;
    company.description = description;
    company.email = email;
    company.phoneNumber = phoneNumber;
    company.website = website;
    company.resources = resources;

    try {
      await this.em.persistAndFlush(company);
      return company;
    } catch (error) {
      this.handleUnexpectedError(error);
    }
  }

  async update(id: string, companyData: Partial<Company>): Promise<Company> {
    try {
      if (!isUUID(id)) {
        throw new BadRequestException(`Invalid UUID format for id: ${id}`);
      }

      const existingCompany = await this.companyRepository.findOne({ id });
      if (!existingCompany) {
        throw new NotFoundException(`Company with id ${id} not found`);
      }

      this.em.assign(existingCompany, companyData);
      await this.em.flush();
      return existingCompany;
    } catch (error) {
      this.handleUnexpectedError(error);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      if (!isUUID(id)) {
        throw new BadRequestException(`Invalid UUID format for id: ${id}`);
      }

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
    } catch (error) {
      this.handleUnexpectedError(error);
    }
  }

  async getAllCompanies(): Promise<Company[]> {
    try {
      return this.companyRepository.findAll();
    } catch (error) {
      this.handleUnexpectedError(error);
    }
  }

  async getCompanyById(id: string): Promise<Company> {
    try {
      if (!isUUID(id)) {
        throw new BadRequestException(`Invalid UUID format for id: ${id}`);
      }

      const company = await this.companyRepository.findOne({ id });
      if (!company) {
        throw new NotFoundException(`Company with id ${id} not found`);
      }
      return company;
    } catch (error) {
      this.handleUnexpectedError(error);
    }
  }

  async getallPropertiesByCompany(id: string): Promise<PropertyEntity[]> {
    try {
      if (!isUUID(id)) {
        throw new BadRequestException(`Invalid UUID format for id: ${id}`);
      }

      const company = await this.companyRepository.findOne({ id });
      if (!company) {
        throw new NotFoundException(`Company with id ${id} not found`);
      }

      return this.em.find(PropertyEntity, { company });
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