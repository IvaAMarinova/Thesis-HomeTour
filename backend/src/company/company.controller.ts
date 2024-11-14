import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { CompanyService } from './company.service';
import { Company } from './company.entity';
import { PropertyEntity } from '../property/property.entity';
import { FileUploadService } from '../upload/upload.service';

@Controller('companies')
export class CompanyController {
  constructor(
    private readonly companyService: CompanyService,
    private readonly fileUploadService: FileUploadService
  ) {}

  @Post()
  async createCompany(@Body() body: {name: string, description: string, email: string, phoneNumber: string, website: string, resources?: {logo?: string | null, gallery_images?: string[]}}): Promise<Company> {
    return this.companyService.create(body.name, body.description, body.email, body.phoneNumber, body.website, body.resources);
  }

  @Put(':id')
  async updateCompany(@Param('id') id: string, @Body() body: Company): Promise<Company | null> {
    return this.companyService.update(id, body);
  }

  @Delete(':id')
  async deleteCompany(@Param('id') id: string): Promise<void> {
    await this.companyService.delete(id);
  }

  @Get()
  async getAllCompanies(): Promise<Company[]> {
    const companies = await this.companyService.getAllCompanies();
    await Promise.all(companies.map(async (company) => this.mapPresignedUrlsToCompany(company)));
    return companies;
  }

  @Get(':id')
  async getCompany(@Param('id') id: string): Promise<Company> {
    const company = await this.companyService.getCompanyById(id);
    await this.mapPresignedUrlsToCompany(company);
    return company;
  }

  @Get(':id/properties')
  async getallPropertiesByCompany(@Param('id') id: string): Promise<PropertyEntity[]> {
    const properties = await this.companyService.getallPropertiesByCompany(id);

    await Promise.all(properties.map(async (property) => {
      await this.mapPresignedUrlsToProperty(property);
    }));

    return properties;
  }

  async mapPresignedUrlsToCompany(company: Company) {
    if (company.resources?.logo) {
      company.resources.logo = await this.fileUploadService.getPreSignedURLToViewObject(
        company.resources.logo
      );
    }
    if (company.resources?.gallery_images) {
      company.resources.gallery_images = await Promise.all(
        company.resources.gallery_images.map(async (imageKey) => 
          this.fileUploadService.getPreSignedURLToViewObject(imageKey)
        )
      );
    }
  }

  async mapPresignedUrlsToProperty(property: PropertyEntity) {
    if (property.resources?.header_image) {
      property.resources.header_image = await this.fileUploadService.getPreSignedURLToViewObject(
        property.resources.header_image
      );
    }
    if (property.resources?.gallery_images) {
      property.resources.gallery_images = await Promise.all(
        property.resources.gallery_images.map(async (imageKey) => 
          this.fileUploadService.getPreSignedURLToViewObject(imageKey)
        )
      );
    }
  }
}
