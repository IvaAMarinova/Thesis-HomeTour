import { Controller, Get, Request, Post, UseGuards, Body, Res } from '@nestjs/common';
import { Response, CookieOptions } from 'express';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UserResponseDto } from './../user/dto/user-response.dto';
import { UserInputDto } from '../user/dto/user-input.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  private getCookieExpirationTime(days: number): Date {
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000); // 1 day
  }

  private setAuthCookies(res: Response, accessToken: string, refreshToken: string): void {
    const accessTokenOptions: CookieOptions = {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      expires: this.getCookieExpirationTime(1),
      path: '/',
    };

    const refreshTokenOptions: CookieOptions = {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      expires: this.getCookieExpirationTime(30),
      path: '/',
    };

    res.cookie('accessToken', accessToken, accessTokenOptions);
    res.cookie('refreshToken', refreshToken, refreshTokenOptions);
  }

  private clearAuthCookies(res: Response): void {
    const clearOptions: CookieOptions = {
      httpOnly: false,
      secure: false,
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    };

    res.cookie('accessToken', '', clearOptions);
    res.cookie('refreshToken', '', clearOptions);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken } = await this.authService.login(req.user);
    this.setAuthCookies(res, accessToken, refreshToken);
    return { accessToken, refreshToken };
  }

  @Post('register')
  async register(@Body() registerData: UserInputDto, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken } = await this.authService.register(registerData);
    this.setAuthCookies(res, accessToken, refreshToken);
    return { accessToken, refreshToken };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Request() req): Promise<UserResponseDto> {
    if (!req.cookies || !req.cookies.accessToken) {
      throw new UnauthorizedException('No access token found');
    }

    if (!req.user || !req.user.userId) {
      throw new UnauthorizedException('User information is missing in the token');
    }

    const { userId } = req.user;
    const user = await this.authService.getMe(userId);
    return new UserResponseDto(user);
  }

  @Post('refresh-token')
  async refreshToken(@Body() body: { refreshToken: string; accessToken: string }, @Res({ passthrough: true }) res: Response) {
    try {
      const { accessToken, refreshToken } = await this.authService.refreshToken(body.accessToken, body.refreshToken);
      this.setAuthCookies(res, accessToken, refreshToken);
      return { message: 'Tokens refreshed successfully' };
    } catch (error) {
      res.status(401).json({ message: 'Invalid or expired tokens' });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    this.clearAuthCookies(res);
    return { message: 'Logged out successfully' };
  }
}