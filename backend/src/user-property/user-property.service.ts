import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { UserProperty } from './user-property.entity';
import { User } from '../user/user.entity';
import { PropertyEntity } from '../property/property.entity';

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
    if (!userId || !propertyId) {
      throw new BadRequestException('User ID and Property ID must be provided');
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

    try {
      await this.em.transactional(async (em) => {
        await em.persistAndFlush(userProperty);
      });
    } catch (error) {
      throw new Error(`Failed to create UserProperty: ${error.message}`);
    }

    return userProperty;
  }

  async update(userPropertyId: string, liked: boolean): Promise<UserProperty> {
    const userProperty = await this.userPropertyRepository.findOne({ id: userPropertyId });
    if (!userProperty) {
      throw new NotFoundException(`UserProperty with ID ${userPropertyId} not found`);
    }

    userProperty.liked = liked;

    try {
      await this.em.flush();
    } catch (error) {
      throw new Error(`Failed to update UserProperty: ${error.message}`);
    }

    return userProperty;
  }

  async delete(id: string): Promise<void> {
    const userProperty = await this.userPropertyRepository.findOne({ id });
    if (!userProperty) {
      throw new NotFoundException(`UserProperty with ID ${id} not found`);
    }

    try {
      await this.em.transactional(async (em) => {
        await em.removeAndFlush(userProperty);
      });
    } catch (error) {
      throw new Error(`Failed to delete UserProperty: ${error.message}`);
    }
  }

  async getUserProperties(userId: string): Promise<UserProperty[]> {
    if (!userId) {
      throw new BadRequestException('User ID must be provided');
    }
  
    return this.userPropertyRepository.find(
      { user: { id: userId } },
      { populate: ['property'] }
    );
  }
  

  async getAllUserProperties(): Promise<UserProperty[]> {
    return this.userPropertyRepository.findAll({ populate: ['user', 'property'] });
  }

  async getPropertyUsers(propertyId: string): Promise<UserProperty[]> {
    if (!propertyId) {
      throw new BadRequestException('Property ID must be provided');
    }
  
    return this.userPropertyRepository.find(
      { property: { id: propertyId } },
      { populate: ['user'] }
    );
  }
  
  
}
