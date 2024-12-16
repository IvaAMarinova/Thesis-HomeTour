import { Controller, Get, Request, Post, UseGuards, Body, Res } from '@nestjs/common';
import { Response } from 'express';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UserResponseDto } from 'src/user/dto/user-response.dto';

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
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
    });
    
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
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
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      path: '/',
    });
    
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 30 * 24 * 3600 * 1000,
      path: '/',
    });
    
    return { message: 'Register in successfully' };
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
    try {
      const user = await this.authService.getMe(userId);      
      return new UserResponseDto(user);
    } catch (error) {
      throw error;
    }
  }

  @Post('refresh-token')
  async refreshToken(
    @Body() body: { refreshToken: string; accessToken: string },
    @Res({ passthrough: true }) res: Response
  ) {

    try {
      const { accessToken, refreshToken } = await this.authService.refreshToken(
        body.accessToken,
        body.refreshToken
      );      
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
        path: '/',
      });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        path: '/',
      });

      return { message: 'Tokens refreshed successfully' };
    } catch (error) {
      res.status(401).json({ message: 'Invalid or expired tokens' });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.cookie('accessToken', '', {
      httpOnly: false,
      secure: false,
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    res.cookie('refreshToken', '', {
      httpOnly: false,
      secure: false,
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return { message: 'Logged out successfully' };
  }
}