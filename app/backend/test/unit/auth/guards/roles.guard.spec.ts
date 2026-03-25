import { ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../../../src/users/enums/role.enum';
import { RolesGuard } from '../../../../src/auth/guards/roles.guard';

describe('RolesGuard', () => {
  let reflector: jest.Mocked<Reflector>;
  let guard: RolesGuard;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as jest.Mocked<Reflector>;
    guard = new RolesGuard(reflector);
  });

  function createContext(user?: { role?: Role }): ExecutionContext {
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as unknown as ExecutionContext;
  }

  it('allows the request when no roles are required', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    expect(guard.canActivate(createContext())).toBe(true);
  });

  it('throws unauthorized when the request has no authenticated role', () => {
    reflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);

    expect(() => guard.canActivate(createContext())).toThrow(HttpException);

    try {
      guard.canActivate(createContext());
    } catch (error) {
      const exception = error as HttpException;
      expect(exception.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
      expect(exception.getResponse()).toEqual({
        code: 'auth.unauthorized',
        message: 'Authentication required',
      });
    }
  });

  it('throws forbidden when the user role is insufficient', () => {
    reflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);

    expect(() =>
      guard.canActivate(createContext({ role: Role.STUDENT })),
    ).toThrow(HttpException);

    try {
      guard.canActivate(createContext({ role: Role.STUDENT }));
    } catch (error) {
      const exception = error as HttpException;
      expect(exception.getStatus()).toBe(HttpStatus.FORBIDDEN);
      expect(exception.getResponse()).toEqual({
        code: 'common.forbidden',
        message: 'Insufficient permissions',
      });
    }
  });

  it('allows the request when the user role is included in the allowed roles', () => {
    reflector.getAllAndOverride.mockReturnValue([Role.ADMIN, Role.TEACHER]);

    expect(guard.canActivate(createContext({ role: Role.ADMIN }))).toBe(true);
  });
});
