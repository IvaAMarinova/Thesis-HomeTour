import { Injectable, NotFoundException } from '@nestjs/common';
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
    const user = await this.userRepository.findOne({ id: userId });
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }
    const property = await this.propertyRepository.findOne({ id: propertyId });
    if (!property) {
      throw new NotFoundException(`Property with id ${propertyId} not found`);
    }
    const userProperty = new UserProperty();
    userProperty.user = user;
    userProperty.property = property;
    userProperty.liked = liked;
    await this.em.persistAndFlush(userProperty);
    return userProperty;
  }

  async update(userPropertyId: string, liked: boolean): Promise<UserProperty> {
    const userProperty = await this.userPropertyRepository.findOne({ id: userPropertyId });
    if (!userProperty) {
      throw new NotFoundException(`UserProperty with id ${userPropertyId} not found`);
    }
    userProperty.liked = liked;
    await this.em.flush();
    return userProperty;
  }

  async delete(id: string): Promise<void> {
    const userProperty = await this.userPropertyRepository.findOne({ id });
    if (!userProperty) {
      throw new NotFoundException(`UserProperty with id ${id} not found`);
    }
    await this.em.removeAndFlush(userProperty);
  }

  async getUserProperties(userId: string): Promise<UserProperty[]> {
    return this.userPropertyRepository.find({ user: { id: userId } });
  }

  async getPropertyUsers(propertyId: string): Promise<UserProperty[]> {
    return this.userPropertyRepository.find({ property: { id: propertyId } });
  }
}
