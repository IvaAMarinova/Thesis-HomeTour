import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { IUser } from '../user/user.inteface';
import { UserType } from '../user/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    try {
      console.log(`[AuthService] validateUser: Attempting to validate user with email: ${email}`);
      console.log(`[AuthService] validateUser: Password: ${password}`);
      const user = await this.userService.validateUser(email, password);
      
      const { password: _, ...result } = user;
      return result;
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async login(user: IUser) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      email: user.email,
      name: user.fullName
    };
  }

  async register(email: string, password: string, fullName: string, companyId: string, type: string): Promise<IUser> {
    const existingUser = await this.userService.findByEmail(email);
    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }
    
    const userType = this.validateAndConvertUserType(type);
    
    try {
      return await this.userService.create(fullName, email, password, userType, companyId);
    } catch (error) {
      throw new Error(`Failed to register user: ${error.message}`);
    }
  }

  private validateAndConvertUserType(type: string): UserType {
    const upperCaseType = type.toUpperCase();
    if (upperCaseType in UserType) {
      return UserType[upperCaseType as keyof typeof UserType];
    }
    throw new BadRequestException(`Invalid user type: ${type}`);
  }
}