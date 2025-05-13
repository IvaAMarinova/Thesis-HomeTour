import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import {
  EntityManager,
  UniqueConstraintViolationException,
} from '@mikro-orm/core';
import { User, UserRole, UserType } from './user.entity';
import { CompanyService } from '../company/company.service';
import { hash, compare } from 'bcrypt';
import { isUUID } from 'class-validator';
import { UserInputDto } from './dto/user-input.dto';
import { Tokens } from '../auth/tokens.entity';
import { PartialUserInputDto } from './dto/user-partial-input.dto';
import { UserInternalInputDto } from './dto/user-internal-input.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly companyService: CompanyService,
    private readonly em: EntityManager,
  ) {}

  async createLogic(
    userData: UserInputDto | UserInternalInputDto,
  ): Promise<User> {
    try {
      const existingUser = await this.em.findOne(User, {
        email: userData.email,
      });
      if (existingUser) {
        throw new ConflictException(`User with this email already exists`);
      }

      if (userData.password) {
        userData.password = await hash(userData.password, 10);
      }

      const user = this.em.create(User, userData);

      if (userData.company) {
        const company = await this.companyService.getCompanyById(
          userData.company,
        );
        if (!company) {
          console.log('Company with this id not found');
          throw new NotFoundException(`Company not found`);
        }
        user.company = company;
      }

      await this.em.persistAndFlush(user);
      return user;
    } catch (error) {
      if (error instanceof UniqueConstraintViolationException) {
        throw new ConflictException(`User with this email already exists`);
      }
      this.handleUnexpectedError(error);
    }
  }

  async create(userData: UserInputDto): Promise<User> {
    return this.createLogic(userData);
  }

  async createInternal(userData: UserInternalInputDto): Promise<User> {
    return this.createLogic(userData);
  }

  async update(id: string, userData: PartialUserInputDto): Promise<User> {
    try {
      if (!isUUID(id)) {
        throw new BadRequestException(`Invalid ID format for id`);
      }
      const existingUser = await this.em.findOne(User, { id });
      if (!existingUser) {
        throw new NotFoundException(`User with id not found`);
      }

      this.em.assign(existingUser, userData);
      await this.em.flush();
      return existingUser;
    } catch (error) {
      this.handleUnexpectedError(error);
    }
  }

  async updateAdmin(
    id: string,
    userData: Partial<UserInputDto>,
  ): Promise<User> {
    try {
      if (!isUUID(id)) {
        throw new BadRequestException(`Invalid ID format for id`);
      }
      const existingUser = await this.em.findOne(User, { id });
      if (!existingUser) {
        throw new NotFoundException(`User with id not found`);
      }

      if (userData.company) {
        const company = await this.companyService.getCompanyById(
          userData.company,
        );
        if (!company) {
          throw new NotFoundException(`Company not found`);
        }
        existingUser.company = company;
      }

      const { company, ...otherUserData } = userData;
      this.em.assign(existingUser, otherUserData);
      await this.em.flush();
      return existingUser;
    } catch (error) {
      this.handleUnexpectedError(error);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      if (!isUUID(id)) {
        throw new BadRequestException(`Invalid ID format for id`);
      }
      const user = await this.em.findOne(User, { id });
      if (!user) {
        throw new NotFoundException(`User not found`);
      }
      await this.em.removeAndFlush(user);
    } catch (error) {
      this.handleUnexpectedError(error);
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      return this.em.findAll(User, {});
    } catch (error) {
      this.handleUnexpectedError(error);
    }
  }

  async getUserById(id: string): Promise<User> {
    try {
      if (!isUUID(id)) {
        throw new BadRequestException(`Invalid ID format for id`);
      }
      const user = await this.em.findOne(User, { id });
      if (!user) {
        throw new NotFoundException(`User with id not found`);
      }
      return user;
    } catch (error) {
      this.handleUnexpectedError(error);
    }
  }

  async validateUser(email: string, password: string): Promise<User> {
    try {
      const user = await this.em.findOne(User, { email });
      if (!user || !(await this.validatePassword(user, password))) {
        throw new UnauthorizedException(`Invalid user or password.`);
      }

      return user;
    } catch (error) {
      this.handleUnexpectedError(error);
    }
  }

  async saveTokens(
    id: string,
    accessToken: string,
    refreshToken: string,
  ): Promise<Tokens> {
    try {
      const user = await this.em.findOne(User, { id });
      if (!user) {
        throw new NotFoundException(`User with id not found`);
      }

      const tokens = this.em.create(Tokens, {
        user,
        accessToken,
        refreshToken,
      });

      await this.em.persistAndFlush(tokens);
      return tokens;
    } catch (error) {
      this.handleUnexpectedError(error);
    }
  }

  async getUserByTokens(
    accessToken: string,
    refreshToken: string,
  ): Promise<User | null> {
    try {
      const tokens = await this.em.findOne(Tokens, {
        accessToken,
        refreshToken,
      });
      if (!tokens) {
        return null;
      }
      return await this.em.findOne(User, { id: tokens.user });
    } catch (error) {
      this.handleUnexpectedError(error);
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      return this.em.findOne(User, { email });
    } catch (error) {
      throw new BadRequestException(`Failed to find user by email`);
    }
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return await compare(password, user.password);
  }

  async makeUserAdmin(id: string): Promise<User> {
    try {
      const user = await this.em.findOne(User, { id });
      if (!user) {
        throw new NotFoundException(`User not found`);
      }

      if (!user.roles.includes(UserRole.ADMIN)) {
        user.roles.push(UserRole.ADMIN);
      }

      await this.em.persistAndFlush(user);

      return user;
    } catch (error) {
      this.handleUnexpectedError(error);
    }
  }

  async makeUserB2B(userId: string, companyId: string): Promise<User> {
    try {
      console.log('User ID:', userId);
      console.log('Company ID:', companyId);
      const user = await this.em.findOne(User, { id: userId });
      if (!user) {
        throw new NotFoundException(`User not found`);
      }
      const company = await this.companyService.getCompanyById(companyId);
      if (!company) {
        throw new NotFoundException(`Company not found`);
      }

      this.em.assign(user, { company, type: UserType.B2B });
      await this.em.persistAndFlush(user);
      return user;
    } catch (error) {
      this.handleUnexpectedError(error);
    }
  }

  async makeUserB2BByEmail(email: string, companyId: string): Promise<User> {
    try {
      const user = await this.em.findOne(User, { email: email });
      if (!user) {
        throw new NotFoundException(`User not found`);
      }
      const company = await this.companyService.getCompanyById(companyId);
      if (!company) {
        throw new NotFoundException(`Company not found`);
      }

      this.em.assign(user, { company, type: UserType.B2B });
      await this.em.persistAndFlush(user);
      return user;
    } catch (error) {
      this.handleUnexpectedError(error);
    }
  }

  async makeUserB2C(userId: string): Promise<User> {
    try {
      const user = await this.em.findOne(User, { id: userId });
      if (!user) {
        throw new NotFoundException(`User not found`);
      }

      this.em.assign(user, { type: UserType.B2C });
      this.em.assign(user, { company: null });
      await this.em.persistAndFlush(user);
      return user;
    } catch (error) {
      this.handleUnexpectedError(error);
    }
  }

  private handleUnexpectedError(error: any): never {
    if (
      error instanceof BadRequestException ||
      error instanceof NotFoundException ||
      error instanceof UnauthorizedException ||
      error instanceof ConflictException
    ) {
      throw error;
    }

    console.error('Unexpected error occurred:', error);
    throw new BadRequestException(
      `An unexpected error occurred: ${error.message}`,
    );
  }
}
