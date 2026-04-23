import authConfig from '../../../src/auth/auth.config';

describe('auth.config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.JWT_ACCESS_SECRET;
    delete process.env.JWT_REFRESH_SECRET;
    delete process.env.JWT_ACCESS_EXPIRES_IN;
    delete process.env.JWT_REFRESH_EXPIRES_IN;
    delete process.env.AUTH_REFRESH_COOKIE_NAME;
    delete process.env.COOKIE_SECURE;
    delete process.env.COOKIE_SAME_SITE;
    delete process.env.FRONTEND_URL;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('uses defaults and normalizes same-site to lax', () => {
    const result = authConfig();

    expect(result).toEqual({
      accessSecret: undefined,
      refreshSecret: undefined,
      accessExpiresIn: '15m',
      refreshExpiresIn: '7d',
      refreshCookieName: 'refresh_token',
      cookieSecure: false,
      cookieSameSite: 'lax',
      frontendUrl: 'http://localhost:5173',
    });
  });

  it('accepts strict and none same-site values from the environment', () => {
    process.env.JWT_ACCESS_SECRET = 'access';
    process.env.JWT_REFRESH_SECRET = 'refresh';
    process.env.JWT_ACCESS_EXPIRES_IN = '30m';
    process.env.JWT_REFRESH_EXPIRES_IN = '10d';
    process.env.AUTH_REFRESH_COOKIE_NAME = 'refresh_cookie';
    process.env.COOKIE_SECURE = 'true';
    process.env.COOKIE_SAME_SITE = ' strict ';
    process.env.FRONTEND_URL = 'https://frontend.example.com';

    expect(authConfig()).toEqual({
      accessSecret: 'access',
      refreshSecret: 'refresh',
      accessExpiresIn: '30m',
      refreshExpiresIn: '10d',
      refreshCookieName: 'refresh_cookie',
      cookieSecure: true,
      cookieSameSite: 'strict',
      frontendUrl: 'https://frontend.example.com',
    });

    process.env.COOKIE_SAME_SITE = 'none';
    expect(authConfig().cookieSameSite).toBe('none');
  });
});
