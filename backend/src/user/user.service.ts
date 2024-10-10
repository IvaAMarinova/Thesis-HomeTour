import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { User } from './user.entity';
import { CompanyService } from '../company/company.service';
import { UserType } from './user.entity';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
    private readonly companyService: CompanyService,
    private readonly em: EntityManager,
  ) {}

  async create(fullName: string, email: string, password: string, type: UserType, companyId?: string): Promise<User> {
    const user = new User();
    user.fullName = fullName;
    user.email = email;
    user.password = password;
    user.type = type;

    if (companyId) {
      const company = await this.companyService.getCompanyById(companyId);
      if (!company) {
        throw new NotFoundException(`Company with id ${companyId} not found`);
      }
      user.company = company;
    }

    await this.em.persistAndFlush(user);
    return user;
  }

  async update(id: string, userData: Partial<User>): Promise<User> {
    const existingUser = await this.userRepository.findOne({ id });
    if (!existingUser) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    this.em.assign(existingUser, userData);

    await this.em.flush();
    return existingUser;
  }

  async delete(id: string): Promise<void> {
    const user = await this.userRepository.findOne({ id });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    await this.em.removeAndFlush(user);
  }

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ id });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userRepository.findOne({ email });
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    if (user.password !== password) {
      throw new UnauthorizedException(`Invalid password for user ${email}`);
    }
    return user;
  }
}
