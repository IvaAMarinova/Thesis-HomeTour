import { Injectable } from '@nestjs/common';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class RolesGuard extends AuthGuard('roles') {
    canActivate(context: ExecutionContext): boolean {
        return super.canActivate(context) as boolean;
    }
}
