import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { CompanyService } from './company.service';
import { Company } from './company.entity';
import { PropertyEntity } from '../property/property.entity';

@Controller('companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

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
    return this.companyService.getAllCompanies();
  }

  @Get(':id')
  async getCompany(@Param('id') id: string): Promise<Company> {
    return this.companyService.getCompanyById(id);
  }

  @Get(':id/properties')
  async getallPropertiesByCompany(@Param('id') id:string) : Promise<PropertyEntity[]> {
    return this.companyService.getallPropertiesByCompany(id);
  }
}
