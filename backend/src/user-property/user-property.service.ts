import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager } from '@mikro-orm/core';
import { UserProperty } from './user-property.entity';
import { User } from 'src/user/user.entity';
import { PropertyEntity } from 'src/property/property.enity';

@Injectable()
export class UserPropertyService {
  constructor(
    @InjectRepository(UserProperty)
    private readonly userPropertyRepository: EntityManager,
    private readonly em: EntityManager,
  ) {}
  
  async create(userId: string, propertyId: string, liked: boolean): Promise<UserProperty> {
    const user = await this.em.findOne(User, { id: userId });
    const property = await this.em.findOne(PropertyEntity, { id: propertyId });
    const userProperty = new UserProperty();
    userProperty.user = user;
    userProperty.property = property;
    userProperty.liked = liked;
    await this.em.persistAndFlush(userProperty);
    return userProperty;
  }

  async update(userPropertyId: string, liked: boolean): Promise<UserProperty | null> {
    const userProperty = await this.em.findOne(UserProperty, { id: userPropertyId });
    if (!userProperty) {
      return null;
    }
    userProperty.liked = liked;
    await this.em.persistAndFlush(userProperty);
    return userProperty;
  }

  async delete(id: string): Promise<void> {
    const userProperty = await this.userPropertyRepository.findOne(UserProperty, { id });
    if (userProperty) {
      await this.userPropertyRepository.removeAndFlush(userProperty);
    }
  }

  async getUserProperties(userId: string): Promise<UserProperty[]> {
    return this.userPropertyRepository.find(UserProperty, { user: userId });
  }

  async getPropertyUsers(propertyId: string): Promise<UserProperty[]> {
    return this.userPropertyRepository.find(UserProperty, { property: propertyId });
  }
}
