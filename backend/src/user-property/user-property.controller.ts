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

  @Get()
  async getAllUserProperties(): Promise<UserProperty[]> {
    return this.userPropertyService.getAllUserProperties();
  }

  @Put(':id')
  async updateUserProperty(@Param('id') id: string, @Body() body: { liked: boolean }): Promise<UserProperty> {
    return this.userPropertyService.update(id, body.liked);
  }

  @Delete(':id')
  async deleteUserProperty(@Param('id') id: string): Promise<void> {
    await this.userPropertyService.delete(id);
  }

  @Get('/user-id-liked/:userId')
  async getLikedUserProperties(@Param('userId') userId: string): Promise<UserProperty[]> {
    return this.userPropertyService.getLikedUserProperties(userId);
  }

  @Get('/property-id/:propertyId')
  async getPropertyUsers(@Param('propertyId') propertyId: string): Promise<UserProperty[]> {
    return this.userPropertyService.getPropertyUsers(propertyId);
  }

  @Put('/user-id/:userId')
  async updateUserPropertyByUserId(@Param('userId') userId: string, @Body() body: { propertyId: string; liked: boolean }): Promise<UserProperty> {
    console.log("[UserPropertyController] User id:", userId);
    console.log("[UserPropertyController] Property id:", body.propertyId);
    console.log("[UserPropertyController] Liked:", body.liked);

    let userProperty;
    try {
      userProperty = await this.userPropertyService.getByIds(userId, body.propertyId);
    } catch (error) {
      console.log("[UserPropertyController] Error getting user property.");
    } 

    if (!userProperty) {
      console.log("[UserPropertyController] User property not found. Creating new one");
      return await this.userPropertyService.create(userId, body.propertyId, body.liked);
    } else {
      console.log("[UserPropertyController] User property found. Updating it");
      return await this.userPropertyService.update(userProperty.id, body.liked);
    }
  }

}