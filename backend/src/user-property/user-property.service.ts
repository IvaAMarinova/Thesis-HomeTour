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

    console.log("[SERVICE] Updated user property to state:", userProperty.liked);

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
  
  async getByIds(userId: string, propertyId: string): Promise<UserProperty> {
    console.log("[UserPropertyService] Getting user property by user ID :", userId);
    console.log("[UserPropertyService] Getting user property by property ID :", propertyId);
    if (!userId || !propertyId) {
      console.log("[UserPropertyService] User ID or Property ID is null");
      throw new BadRequestException('User ID and Property ID must be provided');
    }

    const userProperty = await this.userPropertyRepository.findOne({
      user: { id: userId },
      property: { id: propertyId },
    });
    if (!userProperty) {
      console.log("[UserPropertyService] User property not found");
    }
    return userProperty;
  }

  async getLikedUserProperties(userId: string): Promise<UserProperty[]> {
    if (!userId) {
      throw new BadRequestException('User ID must be provided');
    }
  
    // Log the query being made
    console.log(`[SERVICE] Fetching liked user properties for User ID: ${userId}`);
  
    // Fetch the liked properties
    const likedProperties = await this.userPropertyRepository.find(
      { user: { id: userId }, liked: true },
      { populate: ['property'] }
    );
  
    // Log the liked properties and their liked state
    console.log(`[SERVICE] Fetched ${likedProperties.length} liked properties for User ID: ${userId}`);
    
    likedProperties.forEach((userProperty, index) => {
      console.log(`[SERVICE] Liked Property ${index + 1}:`, {
        propertyId: userProperty.property.id,
        liked: userProperty.liked, // Log the 'liked' state
        propertyName: userProperty.property.name, // You can add more details of the property here as needed
      });
    });
  
    return likedProperties;
  }
  
  
}
