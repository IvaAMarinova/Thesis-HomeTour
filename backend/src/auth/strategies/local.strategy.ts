import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string): Promise<any> {
    // console.log(`[LocalStrategy] validate: Attempting to validate user with email: ${email}`);
    try {
      const user = await this.authService.validateUser(email, password);
      // console.log(`[LocalStrategy] validate: User validation successful for email: ${email}`);
      return user;
    } catch (error) {
      // console.log(`[LocalStrategy] validate: User validation failed for email: ${email}`);
      throw new UnauthorizedException('Invalid credentials');
    }
  }
}