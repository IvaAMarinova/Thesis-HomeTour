import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { IUser } from '../user/user.inteface';
import { UserType } from '../user/user.entity';
import { v4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    try {
      const user = await this.userService.validateUser(email, password);
      const { password: _, ...result } = user;
      return result;
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async login(user: IUser) {
    const payload = { email: user.email, sub: user.id };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = v4();

    await this.userService.saveTokens(user.id, accessToken, refreshToken);

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }

  async register(email: string, password: string, fullName: string, companyId: string, type: string): Promise<any> {
    const existingUser = await this.userService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }
  
    const userType = this.validateAndConvertUserType(type);
  
    try {
      const user = await this.userService.create(fullName, email, password, userType, companyId);
      this.login(user);
    } catch (error) {
      throw new BadRequestException(`Failed to register user: ${error.message}`);
    }
  }
  
  private validateAndConvertUserType(type: string): UserType {
    const upperCaseType = type.toUpperCase();
    if (upperCaseType in UserType) {
      return UserType[upperCaseType as keyof typeof UserType];
    }
    throw new BadRequestException(`Invalid user type: ${type}`);
  }

  async getMe(userId: string): Promise<IUser> {
    const user = await this.userService.getUserById(userId);
    if (!user) {
      throw new UnauthorizedException(`User with id ${userId} not found`);
    }
    return user;
  }

  async refreshToken(accessToken: string, refreshToken: string): Promise<any> {
    try {
      const decoded = this.jwtService.verify(accessToken);
  
      const user = await this.userService.getUserById(decoded.sub);
      console.log("[Auth Service] User with id from access token: ", user);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      if(user.accessToken === accessToken && user.refreshToken === refreshToken)
      {
        const payload = { email: user.email, sub: user.id };
        const newAccessToken = this.jwtService.sign(payload);
        const newRefreshToken = v4();  
        return {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken
        };
      } else {
        throw new UnauthorizedException("Tokens don't match.");
      }
  
      
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }  
}
