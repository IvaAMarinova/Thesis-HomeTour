import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { UserProperty } from './user-property.entity';
import { User } from '../user/user.entity';
import { PropertyEntity } from '../property/property.entity';
import { isUUID } from 'class-validator';

@Injectable()
export class UserPropertyService {
  constructor(
    @InjectRepository(UserProperty)
    private readonly userPropertyRepository: EntityRepository<UserProperty>,
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
    @InjectRepository(PropertyEntity)
    private readonly propertyRepository: EntityRepository<PropertyEntity>,
    private readonly em: EntityManager,
  ) {}

  async create(userId: string, propertyId: string, liked: boolean): Promise<UserProperty> {
    try {
      if (!userId || !propertyId) {
        throw new BadRequestException('User ID and Property ID must be provided');
      }
      if (!isUUID(userId) || !isUUID(propertyId)) {
        throw new BadRequestException('Invalid UUID format for User ID or Property ID');
      }

      const user = await this.userRepository.findOne({ id: userId });
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      const property = await this.propertyRepository.findOne({ id: propertyId });
      if (!property) {
        throw new NotFoundException(`Property with ID ${propertyId} not found`);
      }

      const existingUserProperty = await this.userPropertyRepository.findOne({
        user,
        property,
      });
      if (existingUserProperty) {
        throw new BadRequestException(
          `UserProperty already exists for User ID ${userId} and Property ID ${propertyId}`,
        );
      }

      const userProperty = new UserProperty();
      userProperty.user = user;
      userProperty.property = property;
      userProperty.liked = liked;

      await this.em.transactional(async (em) => {
        await em.persistAndFlush(userProperty);
      });

      return userProperty;
    } catch (error) {
      this.handleUnexpectedError(error);
    }
  }

  async update(userPropertyId: string, liked: boolean): Promise<UserProperty> {
    try {
      if (!isUUID(userPropertyId)) {
        throw new BadRequestException(`Invalid UUID format for ID: ${userPropertyId}`);
      }

      const userProperty = await this.userPropertyRepository.findOne({ id: userPropertyId });
      if (!userProperty) {
        throw new NotFoundException(`UserProperty with ID ${userPropertyId} not found`);
      }

      userProperty.liked = liked;

      await this.em.flush();

      console.log('[SERVICE] Updated user property to state:', userProperty.liked);
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

      const userProperty = await this.userPropertyRepository.findOne({ id });
      if (!userProperty) {
        throw new NotFoundException(`UserProperty with ID ${id} not found`);
      }

      await this.em.removeAndFlush(userProperty);
    } catch (error) {
      this.handleUnexpectedError(error);
    }
  }

  async getUserProperties(userId: string): Promise<UserProperty[]> {
    try {
      if (!userId) {
        throw new BadRequestException('User ID must be provided');
      }
      if (!isUUID(userId)) {
        throw new BadRequestException(`Invalid UUID format for User ID: ${userId}`);
      }

      return this.userPropertyRepository.find(
        { user: { id: userId } },
        { populate: ['property'] },
      );
    } catch (error) {
      this.handleUnexpectedError(error);
    }
  }

  async getAllUserProperties(): Promise<UserProperty[]> {
    try {
      return this.userPropertyRepository.findAll({ populate: ['user', 'property'] });
    } catch (error) {
      this.handleUnexpectedError(error);
    }
  }

  async getPropertyUsers(propertyId: string): Promise<UserProperty[]> {
    try {
      if (!propertyId) {
        throw new BadRequestException('Property ID must be provided');
      }
      if (!isUUID(propertyId)) {
        throw new BadRequestException(`Invalid UUID format for Property ID: ${propertyId}`);
      }

      return this.userPropertyRepository.find(
        { property: { id: propertyId } },
        { populate: ['user'] },
      );
    } catch (error) {
      this.handleUnexpectedError(error);
    }
  }

  async getByIds(userId: string, propertyId: string): Promise<UserProperty> {
    try {
      console.log('[UserPropertyService] Getting user property by user ID:', userId);
      console.log('[UserPropertyService] Getting user property by property ID:', propertyId);

      if (!userId || !propertyId) {
        throw new BadRequestException('User ID and Property ID must be provided');
      }
      if (!isUUID(userId) || !isUUID(propertyId)) {
        throw new BadRequestException('Invalid UUID format for User ID or Property ID');
      }

      const userProperty = await this.userPropertyRepository.findOne({
        user: { id: userId },
        property: { id: propertyId },
      });

      if (!userProperty) {
        console.log('[UserPropertyService] User property not found');
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

      const likedProperties = await this.userPropertyRepository.find(
        { user: { id: userId }, liked: true },
        { populate: ['property'] },
      );

      likedProperties.forEach((userProperty, index) => {
        console.log(`[SERVICE] Liked Property ${index + 1}:`, {
          propertyId: userProperty.property.id,
          liked: userProperty.liked,
          propertyName: userProperty.property.name,
        });
      });

      return likedProperties;
    } catch (error) {
      this.handleUnexpectedError(error);
    }
  }

  private handleUnexpectedError(error: any): never {
    if (error instanceof BadRequestException || error instanceof NotFoundException) {
      throw error; // Re-throw known exceptions
    }

    console.error('Unexpected error occurred:', error);
    throw new BadRequestException(`An unexpected error occurred: ${error.message}`);
  }
}
