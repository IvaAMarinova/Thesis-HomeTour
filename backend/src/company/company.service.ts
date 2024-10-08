import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager } from '@mikro-orm/core';
import { Company } from './company.entity';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: EntityManager,
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

  async update(id: string, company: Company): Promise<Company | null> {
    const existingCompany = await this.companyRepository.findOne(Company, { id });
    if (!existingCompany) {
      return null;
    }
    existingCompany.name = company.name;
    existingCompany.description = company.description;
    existingCompany.email = company.email;
    existingCompany.phone_number = company.phone_number;
    existingCompany.website = company.website;
    await this.em.persistAndFlush(existingCompany);
    return existingCompany;
  }

  async delete(id: string): Promise<void> {
    const company = await this.companyRepository.findOne(Company, { id });
    if (company) {
      await this.companyRepository.removeAndFlush(company);
    }
  }

  async getAllCompanies(): Promise<Company[]> {
    return this.companyRepository.findAll(Company);
  }

  async getCompanyById(id: string): Promise<Company | null> {
    return this.companyRepository.findOne(Company, { id });
  }

}
