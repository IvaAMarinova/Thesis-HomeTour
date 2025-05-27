import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

@Injectable()
export class RolesStrategy extends PassportStrategy(Strategy, 'roles') {
  constructor(private reflector: Reflector) {
    super();
  }

  async validate(
    req: Request,
    done: (err: unknown, user: boolean) => void,
  ): Promise<void> {
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      req.route?.stack?.[0]?.handle,
    );

    if (!requiredRoles) {
      return done(null, true);
    }

    const user = req.user as { roles?: string[] };

    if (
      user?.roles &&
      requiredRoles.some((role) => user.roles?.includes(role))
    ) {
      return done(null, true);
    }

    return done(
      new UnauthorizedException(
        `User does not have the required role. User roles: ${user?.roles?.join(', ')}`,
      ),
      false,
    );
  }
}
