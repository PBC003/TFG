import { registerAs } from '@nestjs/config';
import type { CookieOptions } from 'express';

type SameSite = Exclude<CookieOptions['sameSite'], boolean | undefined>;

function normalizeSameSite(value: string | undefined): SameSite {
  const normalized = value?.trim().toLowerCase();

  if (normalized === 'strict' || normalized === 'none') {
    return normalized;
  }

  return 'lax';
}

export default registerAs('auth', () => ({
  accessSecret: process.env.JWT_ACCESS_SECRET,
  refreshSecret: process.env.JWT_REFRESH_SECRET,
  accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  refreshCookieName: process.env.AUTH_REFRESH_COOKIE_NAME ?? 'refresh_token',
  cookieSecure: process.env.COOKIE_SECURE === 'true',
  cookieSameSite: normalizeSameSite(process.env.COOKIE_SAME_SITE),
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:5173',
}));
