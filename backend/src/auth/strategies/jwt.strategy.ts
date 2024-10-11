import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    // console.log(`[JwtStrategy] constructor: secretOrKey=${process.env.JWT_SECRET}`)
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
    
  }

  async validate(payload: any) {
    // console.log(`[JwtStrategy] validate: payload=${JSON.stringify(payload)}`)
    return { userId: payload.sub, email: payload.email };
  }
}