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
    return this.companyService.mapPresignedUrlsToCompany(user);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateCompany(
    @Param('id') id: string,
    @Body() body: CompanyInputDto,
  ): Promise<TransformedCompanyDto> {
    const updatedCompany = await this.companyService.update(id, body);
    return this.companyService.mapPresignedUrlsToCompany(updatedCompany);
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
      companies.map(async (company) =>
        this.companyService.mapPresignedUrlsToCompany(company),
      ),
    );
    return updatedCompanies;
  }

  @Get(':id')
  async getCompany(@Param('id') id: string): Promise<TransformedCompanyDto> {
    const company = await this.companyService.getCompanyById(id);

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return await this.companyService.mapPresignedUrlsToCompany(company);
  }

  @Get(':id/properties')
  async getallPropertiesByCompany(
    @Param('id') id: string,
  ): Promise<TransformedPropertyDto[]> {
    const properties = await this.companyService.getallPropertiesByCompany(id);

    const updatedProperties = await Promise.all(
      properties.map(async (property) => {
        return this.companyService.mapPresignedUrlsToProperty(property);
      }),
    );

    return updatedProperties;
  }
}
