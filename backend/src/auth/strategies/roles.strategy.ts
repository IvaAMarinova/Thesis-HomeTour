import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesStrategy extends PassportStrategy(Strategy, 'roles') {
    constructor(private reflector: Reflector) {
        super();
    }

    async validate(req: any, done: Function): Promise<any> {
        const requiredRoles = this.reflector.get<string[]>('roles', req.route.stack[0].handle);
        if (!requiredRoles) {
            return done(null, true);
        }

        const user = req.user;

        if (user && user.roles && requiredRoles.some((role) => user.roles.includes(role))) {
            return done(null, true);
        }

        return done(new UnauthorizedException('User does not have the required role'), false);
    }
}
