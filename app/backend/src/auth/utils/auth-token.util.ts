import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { CookieOptions } from 'express';
import { UnauthorizedException } from '@nestjs/common';
import type { User } from '../../users/entities/user.entity';
import {
  AccessTokenPayload,
  RefreshTokenPayload,
} from '../types/token-payload.type';
import {
  addDurationToDate,
  parseDurationToMs,
  type DurationString,
} from './duration.util';

export async function signAccessToken(
  jwtService: JwtService,
  configService: ConfigService,
  user: User,
  sessionId: number,
): Promise<string> {
  const payload: AccessTokenPayload = {
    sub: user.id,
    sessionId,
    email: user.email,
    role: user.role,
    type: 'access',
  };

  const accessExpiresIn = (configService.get<string>('auth.accessExpiresIn') ??
    '15m') as DurationString;

  return jwtService.signAsync(payload, {
    secret: configService.getOrThrow<string>('auth.accessSecret'),
    expiresIn: accessExpiresIn,
  });
}

export async function signRefreshToken(
  jwtService: JwtService,
  configService: ConfigService,
  user: User,
  sessionId: number,
): Promise<string> {
  const payload: RefreshTokenPayload = {
    sub: user.id,
    sessionId,
    type: 'refresh',
  };

  const refreshExpiresIn = (configService.get<string>(
    'auth.refreshExpiresIn',
  ) ?? '7d') as DurationString;

  return jwtService.signAsync(payload, {
    secret: configService.getOrThrow<string>('auth.refreshSecret'),
    expiresIn: refreshExpiresIn,
  });
}

export function getRefreshTokenExpiresAt(
  configService: ConfigService,
  from = new Date(),
): Date {
  const refreshExpiresIn = (configService.get<string>(
    'auth.refreshExpiresIn',
  ) ?? '7d') as DurationString;

  return addDurationToDate(refreshExpiresIn, from);
}

export function getRefreshCookieName(configService: ConfigService): string {
  return configService.get<string>('auth.refreshCookieName') ?? 'refresh_token';
}

export function getRefreshCookieClearOptions(
  configService: ConfigService,
): CookieOptions {
  return {
    httpOnly: true,
    secure: configService.get<boolean>('auth.cookieSecure') ?? false,
    sameSite:
      configService.get<CookieOptions['sameSite']>('auth.cookieSameSite') ??
      'lax',
    path: '/',
  };
}

export function getRefreshCookieOptions(
  configService: ConfigService,
): CookieOptions {
  const refreshExpiresIn = (configService.get<string>(
    'auth.refreshExpiresIn',
  ) ?? '7d') as DurationString;

  return {
    ...getRefreshCookieClearOptions(configService),
    maxAge: parseDurationToMs(refreshExpiresIn),
  };
}

export async function verifyRefreshToken(
  jwtService: JwtService,
  configService: ConfigService,
  refreshToken: string,
): Promise<RefreshTokenPayload> {
  try {
    return await jwtService.verifyAsync<RefreshTokenPayload>(refreshToken, {
      secret: configService.getOrThrow<string>('auth.refreshSecret'),
    });
  } catch {
    throw new UnauthorizedException('Invalid refresh token');
  }
}

export async function tryVerifyRefreshToken(
  jwtService: JwtService,
  configService: ConfigService,
  refreshToken: string,
): Promise<RefreshTokenPayload | null> {
  try {
    return await jwtService.verifyAsync<RefreshTokenPayload>(refreshToken, {
      secret: configService.getOrThrow<string>('auth.refreshSecret'),
    });
  } catch {
    return null;
  }
}
