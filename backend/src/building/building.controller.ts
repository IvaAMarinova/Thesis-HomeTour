import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { BuildingService } from './building.service';
import { Building } from './building.entity';

@Controller('buildings')
export class BuildingController {
  constructor(private readonly buildingService: BuildingService) {}

  @Post()
  async createBuilding(@Body() body: {name: string, address: Record<string, any>, companyId: string}): Promise<Building> {
    return this.buildingService.create(body.name, body.address, body.companyId);
  }

  @Put(':id')
  async updateBuilding(@Param('id') id: string, @Body() body: Building): Promise<Building | null> {
    return this.buildingService.update(id, body);
  }

  @Delete(':id')
  async deleteBuilding(@Param('id') id: string): Promise<void> {
    await this.buildingService.delete(id);
  }

  @Get()
  async getAllBuildings(): Promise<Building[]> {
    return this.buildingService.getAllBuildings();
  }

  @Get(':id')
  async getBuilding(@Param('id') id: string): Promise<Building> {
    return this.buildingService.getBuildingById(id);
  }

}
