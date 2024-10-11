import { Controller, Get, Request, Post, UseGuards, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    console.log(`[AuthController] login`);
    return this.authService.login(req.user);
  }

  @Post('register')
  async register(@Body() registerData: { email: string; password: string; fullName: string; type: string; companyId?: string }) {
    const user = await this.authService.register(registerData.email, registerData.password, registerData.fullName, registerData.companyId, registerData.type);
    return this.authService.login(user);
  }
}