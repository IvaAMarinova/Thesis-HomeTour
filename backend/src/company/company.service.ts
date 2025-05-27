import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Company } from './company.entity';
import { PropertyEntity } from '../property/property.entity';
import { isUUID } from 'class-validator';
import { CompanyInputDto } from './dto/company-input.dto';
import { validateOrReject } from 'class-validator';
import { FileUploadService } from '../upload/upload.service';
import { TransformedPropertyDto } from 'src/property/dto/property-transformed-response.dto';
import { TransformedCompanyDto } from './dto/company-transformed-response.dto';

@Injectable()
export class CompanyService {
  constructor(
    private readonly em: EntityManager,
    private readonly fileUploadService: FileUploadService,
  ) {}

  async create(companyData: CompanyInputDto): Promise<Company> {
    try {
      await validateOrReject(Object.assign(new CompanyInputDto(), companyData));
    } catch (errors) {
      console.log(errors);
      throw new BadRequestException(errors);
    }

    const company = this.em.create(Company, companyData);

    try {
      await this.em.persistAndFlush(company);
      return company;
    } catch (error) {
      this.handleUnexpectedError(error);
    }
  }

  async update(
    id: string,
    companyData: Partial<CompanyInputDto>,
  ): Promise<Company> {
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

      const properties = await this.em.find(PropertyEntity, {
        company: company,
      });
      return properties;
    } catch (error) {
      this.handleUnexpectedError(error);
    }
  }

  private handleUnexpectedError(error: unknown): never {
    if (
      error instanceof BadRequestException ||
      error instanceof NotFoundException
    ) {
      throw error;
    }

    if (error instanceof Error) {
      console.error('Unexpected error occurred:', error);
      throw new BadRequestException(
        `An unexpected error occurred: ${error.message}`,
      );
    }

    throw new BadRequestException('An unknown error occurred.');
  }

  async mapPresignedUrlsToCompany(
    company: Company,
  ): Promise<TransformedCompanyDto> {
    const logoImage = company.resources?.logoImage
      ? {
          key: company.resources.logoImage,
          url: await this.fileUploadService.getPreSignedURLToViewObject(
            company.resources.logoImage,
          ),
        }
      : null;

    const galleryImage = company.resources?.galleryImage
      ? {
          key: company.resources.galleryImage,
          url: await this.fileUploadService.getPreSignedURLToViewObject(
            company.resources.galleryImage,
          ),
        }
      : null;

    const transformedResources = {
      logoImage,
      galleryImage,
    };

    return new TransformedCompanyDto({
      id: company.id,
      name: company.name,
      description: company.description,
      phoneNumber: company.phoneNumber,
      email: company.email,
      website: company.website,
      resources: transformedResources,
    });
  }

  async mapPresignedUrlsToProperty(
    property: PropertyEntity,
  ): Promise<TransformedPropertyDto> {
    const headerImage = property.resources?.headerImage
      ? {
          key: property.resources.headerImage,
          url: await this.fileUploadService.getPreSignedURLToViewObject(
            property.resources.headerImage,
          ),
        }
      : null;

    const galleryImages = property.resources?.galleryImages
      ? await Promise.all(
          property.resources.galleryImages.map(async (imageKey) => ({
            key: imageKey,
            url: await this.fileUploadService.getPreSignedURLToViewObject(
              imageKey,
            ),
          })),
        )
      : [];

    const transformedResources = {
      headerImage,
      galleryImages,
    };

    return new TransformedPropertyDto({
      id: property.id,
      name: property.name,
      description: property.description,
      floor: property.floor,
      address: property.address,
      phoneNumber: property.phoneNumber,
      email: property.email,
      company: property.company.id,
      resources: transformedResources,
    });
  }
}
