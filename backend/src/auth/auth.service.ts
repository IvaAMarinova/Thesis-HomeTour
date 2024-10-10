import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { IUser } from '../user/user.inteface';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    console.log(`[AuthService] validateUser: email=${email}, password=${password}`)
    return await this.userService.validateUser(email, password);
  }

  async login(user: IUser) {
    console.log(`[AuthService] login: user=${JSON.stringify(user)}`)
    const payload = { email: user.email, name: user.name };
    return {
      access_token: this.jwtService.sign(payload),
      email: user.email,
      name: user.name
    };
  }
}