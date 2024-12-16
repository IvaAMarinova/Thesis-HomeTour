import { UserPropertyResponseDto } from './dto/user-property-response.dto';
import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { UserPropertyService } from './user-property.service';
import { UserPropertyInputDto } from './dto/user-property-input.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('user-properties')
export class UserPropertyController {
    constructor(private readonly userPropertyService: UserPropertyService) {}

    @UseGuards(JwtAuthGuard)
    @Post()
    async createUserProperty(@Body() body: UserPropertyInputDto): Promise<UserPropertyResponseDto> {
        const userProperty = await this.userPropertyService.create(body.userId, body.propertyId, body.liked);
        return new UserPropertyResponseDto(userProperty);
    }

    @Get()
    async getAllUserProperties(): Promise<UserPropertyResponseDto[]> {
        const userProperties = await this.userPropertyService.getAllUserProperties();
        return userProperties.map(userProperty => new UserPropertyResponseDto(userProperty));
    }

    @UseGuards(JwtAuthGuard)
    @Put(':id')
    async updateUserProperty(@Param('id') id: string, @Body() body: { liked: boolean }): Promise<{ message: string }> {
        await this.userPropertyService.update(id, body.liked);
        return { message: 'User property updated successfully' };
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    async deleteUserProperty(@Param('id') id: string): Promise<{ message: string }> {
        await this.userPropertyService.delete(id);
        return { message: 'User property deleted successfully' };
    }

    @Get('/user-id-liked/:userId')
    async getLikedUserProperties(@Param('userId') userId: string): Promise<UserPropertyResponseDto[]> {
        const likedUserProperties = await this.userPropertyService.getLikedUserProperties(userId);
        return likedUserProperties.map(userProperty => new UserPropertyResponseDto(userProperty));
    }

    @UseGuards(JwtAuthGuard)
    @Get('/property-id/:propertyId')
    async getPropertyUsers(@Param('propertyId') propertyId: string): Promise<UserPropertyResponseDto[]> {
        const userProperties = await this.userPropertyService.getPropertyUsers(propertyId);
        return userProperties.map(userProperty => new UserPropertyResponseDto(userProperty));
    }

    @UseGuards(JwtAuthGuard)
    @Put('/user-id/:userId')
    async updateUserPropertyByUserId(
        @Param('userId') userId: string,
        @Body() body: { propertyId: string; liked: boolean }
    ): Promise<{ message: string }> {
        const existingUserProperty = await this.userPropertyService.getByIds(userId, body.propertyId);

        if (!existingUserProperty) {
            await this.userPropertyService.create(userId, body.propertyId, body.liked);
            return { message: 'User property created successfully' };
        } else {
            await this.userPropertyService.update(existingUserProperty.id, body.liked);
            return { message: 'User property updated successfully' };
        }
    }
}