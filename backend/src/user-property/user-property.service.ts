import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { UserProperty } from './user-property.entity';
import { User } from '../user/user.entity';
import { PropertyEntity } from '../property/property.entity';
import { isUUID } from 'class-validator';
import { UserPropertyInputDto } from './dto/user-property-input.dto';
import { UserPropertyPartialInputDto } from './dto/user-property-partial-input.dto';

@Injectable()
export class UserPropertyService {
  constructor(
    private readonly em: EntityManager,
  ) {}

  async create(body: UserPropertyInputDto): Promise<UserProperty> {
    try {
      if (!body.user || !body.property) {
        throw new BadRequestException('User ID and Property ID must be provided');
      }
      if (!isUUID(body.user) || !isUUID(body.property)) {
        throw new BadRequestException('Invalid UUID format for User ID or Property ID');
      }

      const existingUser = await this.em.findOne(User, { id: body.user });
      if (!existingUser) {
        throw new NotFoundException(`User with ID ${body.user} not found`);
      }

      const existingProperty = await this.em.findOne(PropertyEntity, { id: body.property });
      if (!existingProperty) {
        throw new NotFoundException(`Property with ID ${body.property} not found`);
      }

      const existingUserProperty = await this.em.findOne(UserProperty, {
        user: body.user,
        property: body.property,
      });
      if (existingUserProperty) {
        throw new BadRequestException(
          `UserProperty already exists for User ID ${body.user} and Property ID ${body.property}`,
        );
      }

      const userProperty = this.em.create(UserProperty, {
        ...body,
        existingUser,
        existingProperty,
      });
  
      await this.em.transactional(async (em) => {
        await em.persistAndFlush(userProperty);
      });

      return userProperty;
    } catch (error) {
      this.handleUnexpectedError(error);
    }
  }

  async update(userPropertyId: string, body: Partial<UserPropertyPartialInputDto>): Promise<UserProperty> {
    try {
      if (!isUUID(userPropertyId)) {
        throw new BadRequestException(`Invalid UUID format for ID: ${userPropertyId}`);
      }

      const userProperty = await this.em.findOne(UserProperty, { id: userPropertyId });
      if (!userProperty) {
        throw new NotFoundException(`UserProperty with ID ${userPropertyId} not found`);
      }

      this.em.assign(userProperty, body);
      await this.em.flush();
      return userProperty;
    } catch (error) {
      this.handleUnexpectedError(error);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      if (!isUUID(id)) {
        throw new BadRequestException(`Invalid UUID format for ID: ${id}`);
      }

      const userProperty = await this.em.findOne(UserProperty, { id });
      if (!userProperty) {
        throw new NotFoundException(`UserProperty with ID ${id} not found`);
      }

      await this.em.removeAndFlush(userProperty);
    } catch (error) {
      this.handleUnexpectedError(error);
    }
  }

  async getAllUserProperties(): Promise<UserProperty[]> {
    try {
      return this.em.find(UserProperty, {});
    } catch (error) {
      this.handleUnexpectedError(error);
    }
  }

  async getByIds(userId: string, propertyId: string): Promise<UserProperty> {
    try {
      if (!userId || !propertyId) {
        throw new BadRequestException('User ID and Property ID must be provided');
      }
      if (!isUUID(userId) || !isUUID(propertyId)) {
        throw new BadRequestException('Invalid UUID format for User ID or Property ID');
      }

      const userProperty = await this.em.findOne(UserProperty, {
        user: userId,
        property: propertyId,
      });

      if (!userProperty) {
        return null;
      }
      return userProperty;
    } catch (error) {
      this.handleUnexpectedError(error);
    }
  }

  async getLikedUserProperties(userId: string): Promise<UserProperty[]> {
    try {
      if (!userId) {
        throw new BadRequestException('User ID must be provided');
      }
      if (!isUUID(userId)) {
        throw new BadRequestException(`Invalid UUID format for User ID: ${userId}`);
      }

      const likedProperties = await this.em.find(UserProperty, { user: userId, liked: true });

      return likedProperties;
    } catch (error) {
      this.handleUnexpectedError(error);
    }
  }

  private handleUnexpectedError(error: any): never {
    if (error instanceof BadRequestException || error instanceof NotFoundException) {
      throw error;
    }

    console.error('Unexpected error occurred:', error);
    throw new BadRequestException(`An unexpected error occurred: ${error.message}`);
  }
}