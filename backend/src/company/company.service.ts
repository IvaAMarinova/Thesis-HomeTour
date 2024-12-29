import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Company } from './company.entity';
import { PropertyEntity } from '../property/property.entity';
import { isUUID } from 'class-validator';
import { CompanyInputDto } from './dto/company-input.dto';

@Injectable()
export class CompanyService {
  constructor(
    private readonly em: EntityManager
  ) {}

  async create(companyData: CompanyInputDto): Promise<Company> {
    const company = this.em.create(Company, companyData);

    try {
      await this.em.persistAndFlush(company);
      return company;
    } catch (error) {
      this.handleUnexpectedError(error);
    }
  }

  async update(id: string, companyData: Partial<CompanyInputDto>): Promise<Company> {
    try {
      if (!isUUID(id)) {
        throw new BadRequestException(`Invalid UUID format for id`);
      }

      const existingCompany = await this.em.findOne(Company, { id });
      if (!existingCompany) {
        throw new NotFoundException(`Company not found`);
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
        throw new BadRequestException(`Invalid UUID format for id`);
      }

      const company = await this.em.findOne(Company, { id });
      if (!company) {
        throw new NotFoundException(`Company not found`);
      }

      await this.em.flush();

      await this.em.removeAndFlush(company);
    } catch (error) {
      this.handleUnexpectedError(error);
    }
  }

  async getAllCompanies(): Promise<Company[]> {
    try {
      return this.em.findAll(Company, {});
    } catch (error) {
      this.handleUnexpectedError(error);
    }
  }

  async getCompanyById(id: string): Promise<Company> {
    try {
      if (!isUUID(id)) {
        throw new BadRequestException(`Invalid UUID format for id`);
      }

      console.log("[SERVICE] getCompanyById called with id:", id);

      const company = await this.em.findOne(Company, { id: id });
      if (!company) {
        throw new NotFoundException(`Company not found`);
      }
      return company;
    } catch (error) {
      this.handleUnexpectedError(error);
    }
  }

  async getallPropertiesByCompany(id: string): Promise<PropertyEntity[]> {
    try {
      if (!isUUID(id)) {
        throw new BadRequestException(`Invalid UUID format for id`);
      }

      const company = await this.em.findOne(Company, { id });
      if (!company) {
        throw new NotFoundException(`Company not found`);
      }
  
      const properties = await this.em.find(PropertyEntity, { company: company });
      return properties;
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