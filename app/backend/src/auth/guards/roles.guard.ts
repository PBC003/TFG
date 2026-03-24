import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import type { AppErrorBody } from '../../common/errors/app-http.exception';
import type { AppErrorCode } from '../../common/errors/app-error-code.type';
import { Role } from '../../users/enums/role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

type RequestWithUser = Request & {
  user?: {
    role?: Role;
  };
};

function buildErrorBody(
  code: AppErrorCode,
  message: string,
  details?: Record<string, unknown>,
): AppErrorBody {
  if (details === undefined) {
    return { code, message };
  }

  return { code, message, details };
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const userRole = request.user?.role;

    if (!userRole) {
      throw new HttpException(
        buildErrorBody('auth.unauthorized', 'Authentication required'),
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (!requiredRoles.includes(userRole)) {
      throw new HttpException(
        buildErrorBody('common.forbidden', 'Insufficient permissions'),
        HttpStatus.FORBIDDEN,
      );
    }

    return true;
  }
}
