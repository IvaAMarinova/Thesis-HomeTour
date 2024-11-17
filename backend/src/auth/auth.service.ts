import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
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
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
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
      const payload = { email: user.email, sub: user.id };
      return {
        access_token: this.jwtService.sign(payload),
        refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
      };
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

  async refreshToken(refreshToken: string): Promise<any> {
    try {
      const decoded = this.jwtService.verify(refreshToken);
  
      const user = await this.userService.getUserById(decoded.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
  
      const payload = { email: user.email, sub: user.id };
      const newAccessToken = this.jwtService.sign(payload);
      const newRefreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });  
      return {
        access_token: newAccessToken,
        refresh_token: newRefreshToken
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }  
}
