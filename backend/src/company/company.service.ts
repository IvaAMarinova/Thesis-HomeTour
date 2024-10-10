import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { Company } from './company.entity';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: EntityRepository<Company>,
    private readonly em: EntityManager,
  ) {}

  async create(name: string, description: string, email: string, phone_number: string, website: string): Promise<Company> {
    const company = new Company();
    company.name = name;
    company.description = description;
    company.email = email;
    company.phone_number = phone_number;
    company.website = website;
    await this.em.persistAndFlush(company);
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
}
