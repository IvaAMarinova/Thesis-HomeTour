import {
  Controller,
  Get,
  Request,
  Post,
  UseGuards,
  Body,
  Res,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Response, CookieOptions } from 'express';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UserResponseDto } from './../user/dto/user-response.dto';
import { UserInputDto } from '../user/dto/user-input.dto';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  private readonly isProduction: boolean;

  constructor(
    private authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    this.isProduction =
      this.configService.get<string>('NODE_ENV') === 'production';
  }

  private getCookieExpirationTime(days: number): Date {
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  }

  private setAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
  ): void {
    const accessTokenOptions: CookieOptions = {
      httpOnly: true,
      secure: this.isProduction,
      sameSite: this.isProduction ? 'strict' : 'lax',
      expires: this.getCookieExpirationTime(1),
      path: '/',
    };

    const refreshTokenOptions: CookieOptions = {
      httpOnly: true,
      secure: this.isProduction,
      sameSite: this.isProduction ? 'strict' : 'lax',
      expires: this.getCookieExpirationTime(30),
      path: '/',
    };

    res.cookie('accessToken', accessToken, accessTokenOptions);
    res.cookie('refreshToken', refreshToken, refreshTokenOptions);
  }

  private clearAuthCookies(res: Response): void {
    const isProduction =
      this.configService.get<string>('NODE_ENV') === 'production';

    const clearOptions: CookieOptions = {
      httpOnly: false,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 0,
      path: '/',
    };

    res.cookie('accessToken', '', clearOptions);
    res.cookie('refreshToken', '', clearOptions);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req, @Res() res: Response) {
    try {
      const { accessToken, refreshToken } = await this.authService.login(
        req.user,
      );
      this.setAuthCookies(res, accessToken, refreshToken);
      res.json({ accessToken, refreshToken });
    } catch (error) {
      throw new BadRequestException('Login failed.');
    }
  }

  @Post('register')
  async register(@Body() registerData: UserInputDto, @Res() res: Response) {
    try {
      const { accessToken, refreshToken } =
        await this.authService.register(registerData);
      this.setAuthCookies(res, accessToken, refreshToken);
      res.json({ accessToken, refreshToken });
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new ConflictException('User with this email already exists.');
      } else {
        throw new BadRequestException('Registration failed.');
      }
    }
  }

  @Post('google/auth')
  async googleAuth(
    @Body() userInfo: { email: string; fullName: string },
    @Res() res: Response,
  ) {
    try {
      const tokens = await this.authService.googleRegistrationService(userInfo);
      res.json(tokens);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new ConflictException('User with this email already exists.');
      } else {
        throw new BadRequestException('Login failed.');
      }
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Request() req): Promise<UserResponseDto> {
    if (!req.cookies || !req.cookies.accessToken) {
      throw new UnauthorizedException('No access token found');
    }

    if (!req.user || !req.user.userId) {
      throw new UnauthorizedException(
        'User information is missing in the token',
      );
    }

    const { userId } = req.user;
    const user = await this.authService.getMe(userId);
    return new UserResponseDto(user);
  }

  @Post('refresh-token')
  async refreshToken(
    @Body() body: { refreshToken: string; accessToken: string },
    @Res() res: Response,
  ) {
    try {
      const { accessToken, refreshToken } = await this.authService.refreshToken(
        body.accessToken,
        body.refreshToken,
      );
      this.setAuthCookies(res, accessToken, refreshToken);
      res.json({ message: 'Tokens refreshed successfully' });
    } catch (error) {
      res.status(401).json({ message: 'Invalid or expired tokens' });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Res() res: Response) {
    this.clearAuthCookies(res);
    res.json({ message: 'Logged out successfully' });
  }
}
