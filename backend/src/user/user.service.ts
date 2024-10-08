import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager } from '@mikro-orm/core';
import { User } from './user.entity';
import { Company } from '../company/company.entity';
import { UserType } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: EntityManager,

    @InjectRepository(Company)
    private readonly companyRepository: EntityManager,
    
    private readonly em: EntityManager,
  ) {}

  async create(fullName: string, email: string, type: UserType, companyId?: string): Promise<User> {
    const user = new User();
    user.fullName = fullName;
    user.email = email;
    user.type = type;

    if (companyId) {
      const company = await this.companyRepository.findOne(Company, { id: companyId });
      if (!company) {
        throw new NotFoundException(`Company with id ${companyId} not found`);
      }
      user.company = company as Company;
    }

    await this.em.persistAndFlush(user);
    return user;
  }

  async update(id: string, userData: Partial<User>): Promise<User> {
    const existingUser = await this.userRepository.findOne(User, { id });
    if (!existingUser) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    Object.assign(existingUser, userData);

    await this.em.flush();
    return existingUser;
  }

  async delete(id: string): Promise<void> {
    const user = await this.userRepository.findOne(User, { id });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    await this.userRepository.removeAndFlush(user);
  }

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.findAll(User);
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findOne(User, { id });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }
}
