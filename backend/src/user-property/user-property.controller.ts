import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { UserPropertyService } from './user-property.service';
import { UserProperty } from './user-property.entity';

@Controller('user-properties')
export class UserPropertyController {
  constructor(private readonly userPropertyService: UserPropertyService) {}

  @Post()
  async createUserProperty(@Body() body: { userId: string; propertyId: string; liked: boolean }): Promise<UserProperty> {
    return this.userPropertyService.create(body.userId, body.propertyId, body.liked);
  }

  @Put(':id')
  async updateUserProperty(@Param('id') id: string, @Body() body: { liked: boolean }): Promise<UserProperty> {
    return this.userPropertyService.update(id, body.liked);
  }

  @Delete(':id')
  async deleteUserProperty(@Param('id') id: string): Promise<void> {
    await this.userPropertyService.delete(id);
  }
}