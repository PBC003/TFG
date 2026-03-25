import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { QueryFailedError, Repository } from 'typeorm';
import { User } from '../../../src/users/entities/user.entity';
import { Role } from '../../../src/users/enums/role.enum';
import { AuthSession } from '../../../src/auth/entities/auth-session.entity';
import { AuthService } from '../../../src/auth/auth.service';
import * as passwordUtil from '../../../src/auth/utils/password.util';

jest.mock('../../../src/auth/utils/password.util', () => ({
  hashSecret: jest.fn((value: string) => Promise.resolve(`hashed:${value}`)),
  compareSecret: jest.fn((value: string, hashedValue: string) =>
    Promise.resolve(hashedValue === `hashed:${value}`),
  ),
}));

const hashSecretMock = jest.mocked(passwordUtil.hashSecret);
const compareSecretMock = jest.mocked(passwordUtil.compareSecret);

describe('AuthService', () => {
  let service: AuthService;
  let usersRepository: jest.Mocked<Repository<User>>;
  let authSessionsRepository: jest.Mocked<Repository<AuthSession>>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  const now = new Date('2026-03-24T10:00:00.000Z');

  beforeEach(async () => {
    jest.useFakeTimers().setSystemTime(now);
    hashSecretMock.mockClear();
    compareSecretMock.mockClear();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(AuthSession),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const map: Record<string, unknown> = {
                'auth.accessExpiresIn': '15m',
                'auth.refreshExpiresIn': '7d',
                'auth.refreshCookieName': 'refresh_token',
                'auth.cookieSecure': false,
                'auth.cookieSameSite': 'lax',
              };

              return map[key];
            }),
            getOrThrow: jest.fn((key: string) => {
              const map: Record<string, string> = {
                'auth.accessSecret': 'access-secret',
                'auth.refreshSecret': 'refresh-secret',
              };
              return map[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get(AuthService);
    usersRepository = module.get(getRepositoryToken(User));
    authSessionsRepository = module.get(getRepositoryToken(AuthSession));
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  function buildUser(overrides: Partial<User> = {}): User {
    return Object.assign(new User(), {
      id: 1,
      firstName: 'Pablo',
      lastName: 'Carrasco',
      email: 'uo123456@uniovi.es',
      uo: 'UO123456',
      passwordHash: 'hashed:password123',
      role: Role.STUDENT,
      isActive: true,
      lastLoginAt: null,
      createdAt: new Date('2026-03-20T10:00:00.000Z'),
      updatedAt: new Date('2026-03-20T10:00:00.000Z'),
      ...overrides,
    });
  }

  function buildSession(overrides: Partial<AuthSession> = {}): AuthSession {
    return Object.assign(new AuthSession(), {
      id: 77,
      refreshTokenHash: 'hashed:refresh-token',
      expiresAt: new Date('2026-03-31T10:00:00.000Z'),
      revokedAt: null,
      user: buildUser(),
      ...overrides,
    });
  }

  function mockActiveSessionsQuery(sessions: AuthSession[]) {
    const getMany = jest.fn().mockResolvedValue(sessions);
    const queryBuilder = {
      leftJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany,
    };
    authSessionsRepository.createQueryBuilder.mockReturnValue(
      queryBuilder as never,
    );
    return getMany;
  }

  it('registers a new user with normalized institutional data', async () => {
    const createdUser = buildUser();
    usersRepository.findOne.mockResolvedValue(null);
    usersRepository.create.mockReturnValue(createdUser);
    usersRepository.save.mockResolvedValue(createdUser);

    await expect(
      service.register({
        firstName: '  Pablo  ',
        lastName: '  Carrasco  ',
        email: '  UO123456@UniOvi.es  ',
        password: 'password123',
      }),
    ).resolves.toEqual({
      user: expect.objectContaining({
        email: 'uo123456@uniovi.es',
        uo: 'UO123456',
        firstName: 'Pablo',
        lastName: 'Carrasco',
        role: Role.STUDENT,
      }),
    });

    expect(usersRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'uo123456@uniovi.es',
        uo: 'UO123456',
        passwordHash: 'hashed:password123',
      }),
    );
  });

  it('rejects invalid or duplicate institutional emails during registration', async () => {
    await expect(
      service.register({
        firstName: 'Pablo',
        lastName: 'Carrasco',
        email: 'pablo@example.com',
        password: 'password123',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    usersRepository.findOne.mockResolvedValue(buildUser());

    await expect(
      service.register({
        firstName: 'Pablo',
        lastName: 'Carrasco',
        email: 'uo123456@uniovi.es',
        password: 'password123',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('maps duplicate key database errors during registration', async () => {
    usersRepository.findOne.mockResolvedValue(null);
    usersRepository.create.mockReturnValue(buildUser());
    usersRepository.save.mockRejectedValue(
      new QueryFailedError('INSERT', [], { code: 'ER_DUP_ENTRY' } as never),
    );

    await expect(
      service.register({
        firstName: 'Pablo',
        lastName: 'Carrasco',
        email: 'uo123456@uniovi.es',
        password: 'password123',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('throws a generic internal error for unexpected registration failures', async () => {
    usersRepository.findOne.mockResolvedValue(null);
    usersRepository.create.mockReturnValue(buildUser());
    usersRepository.save.mockRejectedValue(new Error('boom'));

    await expect(
      service.register({
        firstName: 'Pablo',
        lastName: 'Carrasco',
        email: 'uo123456@uniovi.es',
        password: 'password123',
      }),
    ).rejects.toBeInstanceOf(InternalServerErrorException);
  });

  it('logs in active users and issues tokens with a persisted session', async () => {
    const user = buildUser();
    const transientSession = buildSession({ id: 77, refreshTokenHash: 'tmp' });
    const persistedSession = buildSession({ id: 77, refreshTokenHash: 'tmp' });

    usersRepository.findOne.mockResolvedValue(user);
    authSessionsRepository.create.mockReturnValue(transientSession);
    authSessionsRepository.save
      .mockResolvedValueOnce(persistedSession)
      .mockResolvedValueOnce(
        Object.assign(persistedSession, {
          refreshTokenHash: 'hashed:new-refresh',
        }),
      );
    usersRepository.save.mockResolvedValue(user);
    jwtService.signAsync
      .mockResolvedValueOnce('access-token')
      .mockResolvedValueOnce('refresh-token');

    await expect(
      service.login({ email: 'UO123456@UNIOVI.ES', password: 'password123' }),
    ).resolves.toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      user: expect.objectContaining({ id: user.id, email: user.email }),
    });

    expect(authSessionsRepository.create).toHaveBeenCalled();
    expect(jwtService.signAsync).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        sub: user.id,
        sessionId: 77,
        email: user.email,
        role: user.role,
        type: 'access',
      }),
      expect.objectContaining({
        secret: 'access-secret',
        expiresIn: '15m',
      }),
    );
    expect(jwtService.signAsync).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        sub: user.id,
        sessionId: 77,
        type: 'refresh',
      }),
      expect.objectContaining({
        secret: 'refresh-secret',
        expiresIn: '7d',
      }),
    );
    expect(usersRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ lastLoginAt: now }),
    );
  });

  it('rejects invalid login attempts', async () => {
    usersRepository.findOne.mockResolvedValue(null);

    await expect(
      service.login({ email: 'uo123456@uniovi.es', password: 'password123' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    usersRepository.findOne.mockResolvedValue(buildUser({ isActive: false }));
    await expect(
      service.login({ email: 'uo123456@uniovi.es', password: 'password123' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    compareSecretMock.mockResolvedValueOnce(false);
    usersRepository.findOne.mockResolvedValue(buildUser());
    await expect(
      service.login({
        email: 'uo123456@uniovi.es',
        password: 'wrong-password',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('refreshes a valid session and rotates the stored refresh token hash', async () => {
    const session = buildSession();
    jwtService.verifyAsync.mockResolvedValue({
      sub: 1,
      sessionId: session.id,
      type: 'refresh',
    });
    authSessionsRepository.findOne.mockResolvedValue(session);
    jwtService.signAsync
      .mockResolvedValueOnce('new-access-token')
      .mockResolvedValueOnce('new-refresh-token');
    authSessionsRepository.save.mockResolvedValue(session);

    await expect(service.refresh('refresh-token')).resolves.toEqual({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
      user: expect.objectContaining({ id: session.user.id }),
    });

    expect(authSessionsRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        refreshTokenHash: 'hashed:new-refresh-token',
        expiresAt: new Date('2026-03-31T10:00:00.000Z'),
      }),
    );
  });

  it('rejects refresh attempts for revoked, expired or invalid sessions', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      sub: 1,
      sessionId: 77,
      type: 'refresh',
    });
    authSessionsRepository.findOne.mockResolvedValue(
      buildSession({ revokedAt: new Date('2026-03-24T10:01:00.000Z') }),
    );
    await expect(service.refresh('refresh-token')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );

    authSessionsRepository.findOne.mockResolvedValue(
      buildSession({ expiresAt: new Date('2026-03-24T09:59:00.000Z') }),
    );
    await expect(service.refresh('refresh-token')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );

    authSessionsRepository.findOne.mockResolvedValue(
      buildSession({ user: buildUser({ isActive: false }) }),
    );
    await expect(service.refresh('refresh-token')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );

    authSessionsRepository.findOne.mockResolvedValue(buildSession());
    compareSecretMock.mockResolvedValueOnce(false);
    await expect(service.refresh('refresh-token')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('ignores logout when the token is invalid and revokes active sessions when valid', async () => {
    jwtService.verifyAsync.mockRejectedValueOnce(new Error('invalid token'));

    await expect(service.logout('bad-token')).resolves.toBeUndefined();
    expect(authSessionsRepository.findOne).not.toHaveBeenCalled();

    const session = buildSession();
    jwtService.verifyAsync.mockResolvedValueOnce({
      sub: 1,
      sessionId: session.id,
      type: 'refresh',
    });
    authSessionsRepository.findOne.mockResolvedValueOnce(session);

    await expect(service.logout('refresh-token')).resolves.toBeUndefined();
    expect(authSessionsRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ revokedAt: now }),
    );
  });

  it('changes the password only when the current password is valid and the new one is different', async () => {
    const user = buildUser();
    const session = buildSession({ id: 1 });
    usersRepository.findOne.mockResolvedValue(user);
    usersRepository.save.mockResolvedValue(user);
    mockActiveSessionsQuery([session]);

    compareSecretMock.mockResolvedValueOnce(true).mockResolvedValueOnce(false);

    await expect(
      service.changePassword(1, {
        currentPassword: 'password123',
        newPassword: 'password456',
      }),
    ).resolves.toBeUndefined();

    expect(usersRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ passwordHash: 'hashed:password456' }),
    );
    expect(authSessionsRepository.save).toHaveBeenCalledWith([
      expect.objectContaining({ revokedAt: now }),
    ]);
  });

  it('rejects password changes for invalid credentials or repeated passwords', async () => {
    usersRepository.findOne.mockResolvedValue(null);
    await expect(
      service.changePassword(1, {
        currentPassword: 'password123',
        newPassword: 'password456',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    usersRepository.findOne.mockResolvedValue(buildUser());
    compareSecretMock.mockResolvedValueOnce(false);
    await expect(
      service.changePassword(1, {
        currentPassword: 'wrong',
        newPassword: 'password456',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    compareSecretMock.mockResolvedValueOnce(true).mockResolvedValueOnce(true);
    await expect(
      service.changePassword(1, {
        currentPassword: 'password123',
        newPassword: 'password123',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('exposes cookie helpers and refresh expiry calculation from config', () => {
    expect(service.getRefreshCookieName()).toBe('refresh_token');
    expect(service.getRefreshCookieClearOptions()).toEqual({
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
    });
    expect(service.getRefreshCookieOptions()).toEqual({
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 86_400_000,
    });
    expect(service.getRefreshTokenExpiresAt(now).toISOString()).toBe(
      '2026-03-31T10:00:00.000Z',
    );
    expect(configService.get).toHaveBeenCalledWith('auth.refreshExpiresIn');
  });
});
