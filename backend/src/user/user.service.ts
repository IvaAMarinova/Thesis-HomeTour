import { Injectable, NotFoundException, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository, UniqueConstraintViolationException } from '@mikro-orm/core';
import { User } from './user.entity';
import { CompanyService } from '../company/company.service';
import { UserType } from './user.entity';
import { hash, compare } from 'bcrypt';
import { isUUID } from 'class-validator';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
    private readonly companyService: CompanyService,
    private readonly em: EntityManager,
  ) {}

  async create(fullName: string, email: string, password: string, type: UserType, companyId?: string): Promise<User> {
    try {
      const existingUser = await this.findByEmail(email);
      if (existingUser) {
        throw new ConflictException(`User with email ${email} already exists`);
      }

      const user = new User();
      user.fullName = fullName;
      user.email = email;
      user.password = await hash(password, 10);
      user.type = type;

      if (companyId) {
        const company = await this.companyService.getCompanyById(companyId);
        if (!company) {
          console.log("Company with this id not found");
          throw new NotFoundException(`Company with id ${companyId} not found`);
        }
        user.company = company;
      }

      await this.em.persistAndFlush(user);
      return user;
    } catch (error) {
      if (error instanceof UniqueConstraintViolationException) {
        throw new ConflictException(`User with email ${email} already exists`);
      }
      this.handleUnexpectedError(error);
    }
  }

  async update(id: string, userData: { fullName: string; email: string; type: UserType; companyId?: string }): Promise<User> {
    try {
      if (!isUUID(id)) {
        throw new BadRequestException(`Invalid ID format for id: ${id}`);
      }
      const existingUser = await this.userRepository.findOne({ id });
      if (!existingUser) {
        throw new NotFoundException(`User with id ${id} not found`);
      }

      if (userData.companyId) {
        const company = await this.companyService.getCompanyById(userData.companyId);
        if (!company) {
          throw new NotFoundException(`Company with id ${userData.companyId} not found`);
        }
        existingUser.company = company;
      }

      const { companyId, ...otherUserData } = userData;
      Object.assign(existingUser, otherUserData);

      await this.em.flush();
      return existingUser;
    } catch (error) {
      this.handleUnexpectedError(error);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      if (!isUUID(id)) {
        throw new BadRequestException(`Invalid ID format for id: ${id}`);
      }
      const user = await this.userRepository.findOne({ id });
      if (!user) {
        throw new NotFoundException(`User with id ${id} not found`);
      }
      await this.em.removeAndFlush(user);
    } catch (error) {
      this.handleUnexpectedError(error);
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      return this.userRepository.findAll();
    } catch (error) {
      this.handleUnexpectedError(error);
    }
  }

  async getUserById(id: string): Promise<User> {
    try {
      if (!isUUID(id)) {
        throw new BadRequestException(`Invalid ID format for id: ${id}`);
      }
      const user = await this.userRepository.findOne({ id });
      if (!user) {
        throw new NotFoundException(`User with id ${id} not found`);
      }
      return user;
    } catch (error) {
      this.handleUnexpectedError(error);
    }
  }

  async validateUser(email: string, password: string): Promise<User> {
    try {
      const user = await this.userRepository.findOne({ email });
      if (!user) {
        throw new NotFoundException(`User with email ${email} not found`);
      }
      const isPasswordValid = await this.validatePassword(user, password);
      if (!isPasswordValid) {
        throw new UnauthorizedException(`Invalid password for user ${email}`);
      }
      return user;
    } catch (error) {
      this.handleUnexpectedError(error);
    }
  }

  async saveTokens(id: string, accessToken: string, refreshToken: string): Promise<User> {
    try {
      const user = await this.userRepository.findOne({ id });
      if (!user) {
        throw new NotFoundException(`User with id ${id} not found`);
      }

      user.accessToken = accessToken;
      user.refreshToken = refreshToken;

      await this.em.flush();
      return user;
    } catch (error) {
      this.handleUnexpectedError(error);
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      return this.userRepository.findOne({ email });
    } catch (error) {
      console.error(`[UserService] Error finding user by email: ${error.message}`);
      throw new BadRequestException(`Failed to find user by email: ${error.message}`);
    }
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return await compare(password, user.password);
  }

  private handleUnexpectedError(error: any): never {
    if (error instanceof BadRequestException || 
        error instanceof NotFoundException || 
        error instanceof UnauthorizedException || 
        error instanceof ConflictException) {
      throw error;
    }
  
    console.error("Unexpected error occurred:", error);
    throw new BadRequestException(`An unexpected error occurred: ${error.message}`);
  }
  
}