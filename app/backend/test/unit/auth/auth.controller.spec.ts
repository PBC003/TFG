import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { Request, Response } from 'express';
import { Role } from '../../../src/users/enums/role.enum';
import { AuthController } from '../../../src/auth/auth.controller';
import { AuthService, PublicUser } from '../../../src/auth/auth.service';
import { loadModuleWithoutReflect } from '../helpers/load-without-reflect';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  const publicUser: PublicUser = {
    id: 1,
    firstName: 'Pablo',
    lastName: 'Carrasco',
    email: 'uo123456@uniovi.es',
    uo: 'UO123456',
    role: Role.STUDENT,
    isActive: true,
    createdAt: new Date('2026-03-24T10:00:00.000Z'),
    updatedAt: new Date('2026-03-24T10:00:00.000Z'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
            refresh: jest.fn(),
            logout: jest.fn(),
            changePassword: jest.fn(),
            getRefreshCookieName: jest.fn().mockReturnValue('refresh_token'),
            getRefreshCookieOptions: jest.fn().mockReturnValue({
              httpOnly: true,
              maxAge: 1_000,
              path: '/',
              sameSite: 'lax',
              secure: false,
            }),
            getRefreshCookieClearOptions: jest.fn().mockReturnValue({
              httpOnly: true,
              path: '/',
              sameSite: 'lax',
              secure: false,
            }),
          },
        },
      ],
    }).compile();

    controller = module.get(AuthController);
    authService = module.get(AuthService);
  });

  function createResponse(): Response {
    return {
      cookie: jest.fn(),
      clearCookie: jest.fn(),
    } as unknown as Response;
  }

  it('returns the register response unchanged', async () => {
    authService.register.mockResolvedValue({ user: publicUser });

    await expect(
      controller.register({
        firstName: 'Pablo',
        lastName: 'Carrasco',
        email: publicUser.email,
        password: 'password123',
      }),
    ).resolves.toEqual({ user: publicUser });
  });

  it('sets the refresh cookie on login and omits it from the response body', async () => {
    const response = createResponse();
    authService.login.mockResolvedValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      user: publicUser,
    });

    await expect(
      controller.login(
        { email: publicUser.email, password: 'password123' },
        response,
      ),
    ).resolves.toEqual({
      accessToken: 'access-token',
      user: publicUser,
    });

    expect(response.cookie).toHaveBeenCalledWith(
      'refresh_token',
      'refresh-token',
      expect.objectContaining({ httpOnly: true }),
    );
  });

  it('throws when refresh is requested without the refresh cookie', async () => {
    await expect(
      controller.refresh(
        { cookies: {} } as unknown as Request,
        createResponse(),
      ),
    ).rejects.toMatchObject({
      response: {
        code: 'auth.missing_refresh_token',
        message: 'Missing refresh token',
      },
      status: HttpStatus.UNAUTHORIZED,
    });
  });

  it('refreshes the session and rotates the cookie', async () => {
    const response = createResponse();
    authService.refresh.mockResolvedValue({
      accessToken: 'new-access',
      refreshToken: 'new-refresh',
      user: publicUser,
    });

    await expect(
      controller.refresh(
        { cookies: { refresh_token: 'current-refresh' } } as unknown as Request,
        response,
      ),
    ).resolves.toEqual({ accessToken: 'new-access', user: publicUser });

    expect(authService.refresh).toHaveBeenCalledWith('current-refresh');
    expect(response.cookie).toHaveBeenCalledWith(
      'refresh_token',
      'new-refresh',
      expect.objectContaining({ httpOnly: true }),
    );
  });

  it('logs out and always clears the refresh cookie', async () => {
    const response = createResponse();

    await expect(
      controller.logout(
        { cookies: { refresh_token: 'refresh-token' } } as unknown as Request,
        response,
      ),
    ).resolves.toBeUndefined();

    expect(authService.logout).toHaveBeenCalledWith('refresh-token');
    expect(response.clearCookie).toHaveBeenCalledWith(
      'refresh_token',
      expect.objectContaining({ httpOnly: true }),
    );
  });

  it('returns the authenticated user in me and adminCheck', () => {
    const request = { user: publicUser } as Request & { user: PublicUser };

    expect(controller.me(request)).toEqual({ user: publicUser });
    expect(controller.adminCheck(request)).toEqual({
      ok: true,
      user: publicUser,
    });
  });

  it('changes the password and clears the refresh cookie afterwards', async () => {
    const response = createResponse();

    await expect(
      controller.changePassword(
        { user: publicUser } as Request & { user: PublicUser },
        {
          currentPassword: 'password123',
          newPassword: 'password456',
        },
        response,
      ),
    ).resolves.toBeUndefined();

    expect(authService.changePassword).toHaveBeenCalledWith(publicUser.id, {
      currentPassword: 'password123',
      newPassword: 'password456',
    });
    expect(response.clearCookie).toHaveBeenCalledWith(
      'refresh_token',
      expect.objectContaining({ httpOnly: true }),
    );
  });

  it('loads the module without Reflect decorator helpers', () => {
    const { AuthController: ReloadedController } = loadModuleWithoutReflect<
      typeof import('../../../src/auth/auth.controller')
    >('../../../src/auth/auth.controller', __filename);

    expect(new ReloadedController({} as never)).toBeInstanceOf(
      ReloadedController,
    );
  });
});
