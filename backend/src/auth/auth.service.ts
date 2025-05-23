import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { User, UserRole, UserType } from '../user/user.entity';
import { v4 } from 'uuid';
import { UserInputDto } from '../user/dto/user-input.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
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

  async login(
    user: User,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = { email: user.email, sub: user.id, roles: user.roles };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '1d' });
    const refreshToken = v4();

    await this.userService.saveTokens(user.id, accessToken, refreshToken);

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }

  async register(
    userData: UserInputDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const existingUser = await this.userService.findByEmail(userData.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }
    try {
      const user = await this.userService.create(userData);
      return this.login(user);
    } catch (error) {
      throw new BadRequestException(
        `Failed to register user: ${error.message}`,
      );
    }
  }

  async googleRegistrationService(userInfo: {
    email: string;
    fullName: string;
  }): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const user = await this.userService.findByEmail(userInfo.email);

      if (!user) {
        const newUser = await this.userService.createInternal({
          email: userInfo.email,
          fullName: userInfo.fullName,
          isGoogleUser: true,
          roles: [UserRole.USER],
          type: UserType.B2C,
        });

        return this.login(newUser);
      }

      return this.login(user);
    } catch (error) {
      throw new Error('Failed to process Google authentication.');
    }
  }

  async getMe(userId: string): Promise<User> {
    try {
      const user = await this.userService.getUserById(userId);

      if (!user) {
        throw new NotFoundException(`User not found`);
      }

      return user;
    } catch (error) {
      throw new Error('An unexpected error occurred while retrieving the user');
    }
  }

  async refreshToken(
    accessToken: string,
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const user = await this.userService.getUserByTokens(
        accessToken,
        refreshToken,
      );

      if (!user) {
        throw new UnauthorizedException('Invalid or expired tokens');
      }

      const payload = { email: user.email, sub: user.id, roles: user.roles };
      const newAccessToken = this.jwtService.sign(payload);
      const newRefreshToken = v4();

      await this.userService.saveTokens(
        user.id,
        newAccessToken,
        newRefreshToken,
      );

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired tokens');
    }
  }
}
