import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { CompanyService } from './company.service';
import { Company } from './company.entity';
import { PropertyEntity } from '../property/property.entity';
import { FileUploadService } from '../upload/upload.service';
import { TransformedCompanyDto } from './dto/company-transformed-response.dto'
import { TransformedPropertyDto } from '../property/dto/property-transformed-response.dto'

@Controller('companies')
export class CompanyController {
  constructor(
    private readonly companyService: CompanyService,
    private readonly fileUploadService: FileUploadService
  ) {}

  @Post()
  async createCompany(@Body() body: {name: string, description: string, email: string, phoneNumber: string, website: string, resources?: {logoImage?: string | null, galleryImages?: string[]}}): Promise<Company> {
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
  async getAllCompanies(): Promise<TransformedCompanyDto[]> {
    const companies = await this.companyService.getAllCompanies();
    const updatedCompanies = await Promise.all(companies.map(async (company) => this.mapPresignedUrlsToCompany(company)));
    return updatedCompanies;
  }

  @Get(':id')
  async getCompany(@Param('id') id: string): Promise<TransformedCompanyDto> {
    const company = await this.companyService.getCompanyById(id);
    const updatedCompany = await this.mapPresignedUrlsToCompany(company);
    console.log("[Company controller] Company after mapped: ", updatedCompany);
    return updatedCompany;
  }

  @Get(':id/properties')
  async getallPropertiesByCompany(@Param('id') id: string): Promise<TransformedPropertyDto[]> {
    const properties = await this.companyService.getallPropertiesByCompany(id);

    const updatedProperties = await Promise.all(properties.map(async (property) => {
      return this.mapPresignedUrlsToProperty(property);
    }));

    return updatedProperties;
  }

  async mapPresignedUrlsToCompany(company: Company): Promise<TransformedCompanyDto> {
    return {
      id: company.id,
      name: company.name,
      description: company.description,
      phoneNumber: company.phoneNumber,
      email: company.email,
      website: company.website,
      resources: {
        ...company.resources,
        logoImage: company.resources?.logoImage
          ? {
              key: company.resources.logoImage,
              url: await this.fileUploadService.getPreSignedURLToViewObject(company.resources.logoImage),
            }
          : null,
        galleryImages: company.resources?.galleryImages
          ? await Promise.all(
              company.resources.galleryImages.map(async (imageKey) => ({
                key: imageKey,
                url: await this.fileUploadService.getPreSignedURLToViewObject(imageKey),
              }))
            )
          : [],
      },
    };
  }

  async mapPresignedUrlsToProperty(property: PropertyEntity): Promise<TransformedPropertyDto> {
    console.log('[PropertyController] Property Data:', property);
    return {
      id: property.id,
      name: property.name,
      description: property.description,
      floor: property.floor,
      address: property.address,
      phoneNumber: property.phoneNumber,
      email: property.email,
      company: property.company.id,
      building: property.building?.id || null,
      resources: {
        ...property.resources,
        headerImage: property.resources?.headerImage
          ? {
              key: property.resources.headerImage,
              url: await this.fileUploadService.getPreSignedURLToViewObject(property.resources.headerImage),
            }
          : null,
        galleryImages: property.resources?.galleryImages
          ? await Promise.all(
              property.resources.galleryImages.map(async (imageKey) => ({
                key: imageKey,
                url: await this.fileUploadService.getPreSignedURLToViewObject(imageKey),
              }))
            )
          : [],
      },
    };
  }
}
