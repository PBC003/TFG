import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  getRefreshCookieClearOptions,
  getRefreshCookieName,
  getRefreshCookieOptions,
  getRefreshTokenExpiresAt,
  signAccessToken,
  signRefreshToken,
  tryVerifyRefreshToken,
  verifyRefreshToken,
} from '../../../../src/auth/utils/auth-token.util';
import { Role } from '../../../../src/users/enums/role.enum';

describe('auth-token.util', () => {
  const user = {
    id: 7,
    email: 'teacher@example.com',
    role: Role.TEACHER,
  };

  function createConfigService(overrides: Record<string, unknown> = {}) {
    const values: Record<string, unknown> = {
      'auth.accessSecret': 'access-secret',
      'auth.refreshSecret': 'refresh-secret',
      ...overrides,
    };

    return {
      get: jest.fn((key: string) => values[key]),
      getOrThrow: jest.fn((key: string) => values[key]),
    } as unknown as ConfigService;
  }

  it('signs access and refresh tokens using defaults when expirations are missing', async () => {
    const jwtService = {
      signAsync: jest
        .fn()
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token'),
    } as unknown as JwtService;
    const configService = createConfigService();

    await expect(
      signAccessToken(jwtService, configService, user as never, 11),
    ).resolves.toBe('access-token');
    await expect(
      signRefreshToken(jwtService, configService, user as never, 11),
    ).resolves.toBe('refresh-token');

    expect((jwtService.signAsync as jest.Mock).mock.calls[0]).toEqual([
      {
        sub: 7,
        sessionId: 11,
        email: 'teacher@example.com',
        role: Role.TEACHER,
        type: 'access',
      },
      {
        secret: 'access-secret',
        expiresIn: '15m',
      },
    ]);

    expect((jwtService.signAsync as jest.Mock).mock.calls[1]).toEqual([
      {
        sub: 7,
        sessionId: 11,
        type: 'refresh',
      },
      {
        secret: 'refresh-secret',
        expiresIn: '7d',
      },
    ]);
  });

  it('builds cookie names, clear options and maxAge from config values', () => {
    const configService = createConfigService({
      'auth.refreshCookieName': 'custom_refresh',
      'auth.cookieSecure': true,
      'auth.cookieSameSite': 'strict',
      'auth.refreshExpiresIn': '2h',
    });

    expect(getRefreshCookieName(configService)).toBe('custom_refresh');
    expect(getRefreshCookieClearOptions(configService)).toEqual({
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
    });
    expect(getRefreshCookieOptions(configService)).toEqual({
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
      maxAge: 2 * 60 * 60 * 1000,
    });
  });

  it('falls back to default cookie values and computes refresh expiration dates', () => {
    const configService = createConfigService();
    const from = new Date('2026-04-18T10:00:00.000Z');

    expect(getRefreshCookieName(configService)).toBe('refresh_token');
    expect(getRefreshCookieClearOptions(configService)).toEqual({
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
    });
    expect(getRefreshTokenExpiresAt(configService, from).toISOString()).toBe(
      '2026-04-25T10:00:00.000Z',
    );
  });

  it('verifies refresh tokens and throws UnauthorizedException on invalid payloads', async () => {
    const jwtService = {
      verifyAsync: jest
        .fn()
        .mockResolvedValueOnce({ sub: 7, sessionId: 11, type: 'refresh' })
        .mockRejectedValueOnce(new Error('boom'))
        .mockRejectedValueOnce(new Error('boom')),
    } as unknown as JwtService;
    const configService = createConfigService();

    await expect(
      verifyRefreshToken(jwtService, configService, 'good-token'),
    ).resolves.toEqual({ sub: 7, sessionId: 11, type: 'refresh' });

    await expect(
      verifyRefreshToken(jwtService, configService, 'bad-token'),
    ).rejects.toEqual(new UnauthorizedException('Invalid refresh token'));

    await expect(
      tryVerifyRefreshToken(jwtService, configService, 'bad-token'),
    ).resolves.toBeNull();
  });
});
