import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { CompanyService } from './company.service';
import { Company } from './company.entity';
import { PropertyEntity } from '../property/property.entity';
import { FileUploadService } from '../upload/upload.service';
import { TransformedCompanyDto } from './dto/company-transformed-response.dto';
import { TransformedPropertyDto } from '../property/dto/property-transformed-response.dto';
import { CompanyInputDto } from './dto/company-input.dto';
import { JwtAuthGuard } from './../auth/guards/jwt-auth.guard';
import { Roles } from '../decorators/roles.decorator';

@Controller('companies')
export class CompanyController {
  constructor(
    private readonly companyService: CompanyService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  @Roles('admin')
  @UseGuards(JwtAuthGuard)
  @Post()
  async createCompany(
    @Body() body: CompanyInputDto,
  ): Promise<TransformedCompanyDto> {
    const user = await this.companyService.create(body);
    return this.mapPresignedUrlsToCompany(user);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateCompany(
    @Param('id') id: string,
    @Body() body: CompanyInputDto,
  ): Promise<TransformedCompanyDto> {
    const updatedCompany = await this.companyService.update(id, body);
    return this.mapPresignedUrlsToCompany(updatedCompany);
  }

  @Roles('admin')
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteCompany(@Param('id') id: string): Promise<{ message: string }> {
    try {
      await this.companyService.delete(id);
      return { message: 'Company deleted successfully' };
    } catch (error) {
      throw new NotFoundException('Company not found');
    }
  }

  @Get()
  async getAllCompanies(): Promise<TransformedCompanyDto[]> {
    const companies = await this.companyService.getAllCompanies();
    const updatedCompanies = await Promise.all(
      companies.map(async (company) => this.mapPresignedUrlsToCompany(company)),
    );
    return updatedCompanies;
  }

  @Get(':id')
  async getCompany(@Param('id') id: string): Promise<TransformedCompanyDto> {
    const company = await this.companyService.getCompanyById(id);

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return await this.mapPresignedUrlsToCompany(company);
  }

  @Get(':id/properties')
  async getallPropertiesByCompany(
    @Param('id') id: string,
  ): Promise<TransformedPropertyDto[]> {
    const properties = await this.companyService.getallPropertiesByCompany(id);

    const updatedProperties = await Promise.all(
      properties.map(async (property) => {
        return this.mapPresignedUrlsToProperty(property);
      }),
    );

    return updatedProperties;
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
