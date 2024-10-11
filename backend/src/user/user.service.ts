import { Injectable, NotFoundException, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository, UniqueConstraintViolationException } from '@mikro-orm/core';
import { User } from './user.entity';
import { CompanyService } from '../company/company.service';
import { UserType } from './user.entity';
import { compare } from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
    private readonly companyService: CompanyService,
    private readonly em: EntityManager,
  ) {}

  async create(fullName: string, email: string, password: string, type: UserType, companyId?: string): Promise<User> {
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new ConflictException(`User with email ${email} already exists`);
    }

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

    try {
      await this.em.persistAndFlush(user);
    } catch (error) {
      if (error instanceof UniqueConstraintViolationException) {
        throw new ConflictException(`User with email ${email} already exists`);
      }
      throw new Error(`Failed to create user: ${error.message}`);
    }
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

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ email });
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    // return compare(password, user.password);
    return password === user.password;
  }
}
