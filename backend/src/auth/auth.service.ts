import { Injectable, UnauthorizedException, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
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
    const accessToken = this.jwtService.sign(payload, { expiresIn: '1d' });
    const refreshToken = v4();

    await this.userService.saveTokens(user.id, accessToken, refreshToken);

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }

  async register(email: string, password: string, fullName: string, companyId: string, type: string) {
    const existingUser = await this.userService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }
  
    const userType = this.validateAndConvertUserType(type);
  
    try {
      const user = await this.userService.create(fullName, email, password, userType, companyId);
      return this.login(user);
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
    console.log("[AuthService.getMe] Fetching user with ID:", userId);
  
    try {
      const user = await this.userService.getUserById(userId);
  
      if (!user) {
        console.error(`[AuthService.getMe] User with id ${userId} not found in database`);
        throw new NotFoundException(`User with id ${userId} not found`);
      }
  
      console.log("[AuthService.getMe] Retrieved user:", user);
      

      return user;
    } catch (error) {
      console.error(`[AuthService.getMe] Error retrieving user with id ${userId}:`, error.message);
      throw new Error("An unexpected error occurred while retrieving the user");
    }
  }
  

  async refreshToken(
    accessToken: string,
    refreshToken: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      // Decode and validate the accessToken
      const decoded = this.jwtService.decode(accessToken) as { sub: string; email: string };
  
      if (!decoded || !decoded.sub) {
        console.log("Invalid access token");
        throw new UnauthorizedException('Invalid access token');
      }
  
      console.log("[Refresh Token] Decoded AccessToken Subject (UserID):", decoded.sub);
  
      // Find the user by ID from the accessToken
      const user = await this.userService.getUserById(decoded.sub);
  
      if (!user) {
        console.log("User not found");
        throw new UnauthorizedException('User not found');
      }
  
      console.log("[Refresh Token] User Found:", user);
  
      // Validate the refreshToken matches the one stored in the database
      if (user.refreshToken !== refreshToken) {
        console.log("Refresh token does not match");
        throw new UnauthorizedException('Invalid or expired refresh token');
      }
  
      console.log("[Refresh Token] Tokens match. Generating new tokens...");
  
      // Generate new tokens
      const payload = { email: user.email, sub: user.id };
      const newAccessToken = this.jwtService.sign(payload);
      const newRefreshToken = v4(); // Generate a new UUID as the refreshToken
  
      // Save the new tokens in the database
      await this.userService.saveTokens(user.id, newAccessToken, newRefreshToken);
  
      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      console.error("[Refresh Token] Error:", error.message);
      throw new UnauthorizedException('Invalid or expired tokens');
    }
  }
  
}
