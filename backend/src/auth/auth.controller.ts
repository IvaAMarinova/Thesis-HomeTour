import { Controller, Get, Request, Post, UseGuards, Body, Res } from '@nestjs/common';
import { Response } from 'express';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken } = await this.authService.login(req.user);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 3600000,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 3600000,
    });

    return { message: 'Logged in successfully' };
  }

  @Post('register')
  async register(
    @Body() registerData: { email: string; password: string; fullName: string; type: string; companyId?: string }, 
    @Res({ passthrough: true }) res: Response
  ) {
    const { accessToken, refreshToken } = await this.authService.register(registerData.email, registerData.password, registerData.fullName, registerData.companyId, registerData.type);
  
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 3600000,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 3600000,
    });

    return { message: 'Logged in successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Request() req) {
    console.log('[Auth Controller]');
    console.log('[Auth Controller] Cookies:', req.cookies);
    if (!req.cookies || !req.cookies.accessToken) {
      console.log("[Auth controller] No access token");
      throw new UnauthorizedException('No access token found');
    }

    const { userId } = req.user;
    return this.authService.getMe(userId);
  }

  @Post('refresh-token')
  async refreshToken(@Body() body: { refreshToken: string; accessToken: string}) {
    return this.authService.refreshToken(body.refreshToken, body.accessToken);
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.cookie('accessToken', '', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    res.cookie('refreshToken', '', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return { message: 'Logged out successfully' };
  }

}
