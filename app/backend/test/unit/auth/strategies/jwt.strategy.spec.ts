import { HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Role } from '../../../../src/users/enums/role.enum';
import { User } from '../../../../src/users/entities/user.entity';
import { AuthSession } from '../../../../src/auth/entities/auth-session.entity';
import { JwtStrategy } from '../../../../src/auth/strategies/jwt.strategy';

describe('JwtStrategy', () => {
  let authSessionsRepository: { findOne: jest.Mock };
  let configService: { getOrThrow: jest.Mock };
  let strategy: JwtStrategy;

  beforeEach(() => {
    authSessionsRepository = {
      findOne: jest.fn(),
    };
    configService = {
      getOrThrow: jest.fn().mockReturnValue('access-secret'),
    };
    strategy = new JwtStrategy(
      authSessionsRepository as never,
      configService as unknown as ConfigService,
    );
  });

  function buildSession(overrides: Partial<AuthSession> = {}): AuthSession {
    const user = Object.assign(new User(), {
      id: 1,
      firstName: 'Pablo',
      lastName: 'Carrasco',
      email: 'uo123456@uniovi.es',
      uo: 'UO123456',
      role: Role.ADMIN,
      isActive: true,
      createdAt: new Date('2026-03-24T10:00:00.000Z'),
      updatedAt: new Date('2026-03-24T10:00:00.000Z'),
    });

    return Object.assign(new AuthSession(), {
      id: 9,
      refreshTokenHash: 'hash',
      expiresAt: new Date(Date.now() + 60_000),
      revokedAt: null,
      user,
      ...overrides,
    });
  }

  async function expectUnauthorized(
    payload: Parameters<JwtStrategy['validate']>[0],
    message: string,
  ) {
    await expect(strategy.validate(payload)).rejects.toMatchObject({
      response: {
        code: 'auth.invalid_access_token',
        message,
      },
      status: HttpStatus.UNAUTHORIZED,
    });
  }

  it('rejects tokens with an invalid payload type', async () => {
    await expectUnauthorized(
      {
        sub: 1,
        sessionId: 9,
        email: 'uo123456@uniovi.es',
        role: Role.ADMIN,
        type: 'refresh',
      } as never,
      'Invalid access token',
    );
  });

  it('rejects when the session cannot be found', async () => {
    authSessionsRepository.findOne.mockResolvedValue(null);

    await expectUnauthorized(
      {
        sub: 1,
        sessionId: 9,
        email: 'uo123456@uniovi.es',
        role: Role.ADMIN,
        type: 'access',
      },
      'Invalid access token',
    );
  });

  it('rejects revoked sessions', async () => {
    authSessionsRepository.findOne.mockResolvedValue(
      buildSession({ revokedAt: new Date() }),
    );

    await expectUnauthorized(
      {
        sub: 1,
        sessionId: 9,
        email: 'uo123456@uniovi.es',
        role: Role.ADMIN,
        type: 'access',
      },
      'Session revoked',
    );
  });

  it('rejects expired sessions', async () => {
    authSessionsRepository.findOne.mockResolvedValue(
      buildSession({ expiresAt: new Date(Date.now() - 1_000) }),
    );

    await expectUnauthorized(
      {
        sub: 1,
        sessionId: 9,
        email: 'uo123456@uniovi.es',
        role: Role.ADMIN,
        type: 'access',
      },
      'Session expired',
    );
  });

  it('rejects inactive users or mismatched payload users', async () => {
    authSessionsRepository.findOne.mockResolvedValue(
      buildSession({ user: buildSession().user }),
    );
    const inactiveSession = buildSession({
      user: Object.assign(buildSession().user, { isActive: false }),
    });
    authSessionsRepository.findOne.mockResolvedValueOnce(inactiveSession);

    await expectUnauthorized(
      {
        sub: 1,
        sessionId: 9,
        email: 'uo123456@uniovi.es',
        role: Role.ADMIN,
        type: 'access',
      },
      'Invalid access token',
    );

    authSessionsRepository.findOne.mockResolvedValueOnce(buildSession());
    await expectUnauthorized(
      {
        sub: 99,
        sessionId: 9,
        email: 'uo123456@uniovi.es',
        role: Role.ADMIN,
        type: 'access',
      },
      'Invalid access token',
    );
  });

  it('returns a normalized public user for valid sessions', async () => {
    authSessionsRepository.findOne.mockResolvedValue(buildSession());

    await expect(
      strategy.validate({
        sub: 1,
        sessionId: 9,
        email: 'uo123456@uniovi.es',
        role: Role.ADMIN,
        type: 'access',
      }),
    ).resolves.toEqual({
      id: 1,
      firstName: 'Pablo',
      lastName: 'Carrasco',
      email: 'uo123456@uniovi.es',
      uo: 'UO123456',
      role: Role.ADMIN,
      isActive: true,
      createdAt: new Date('2026-03-24T10:00:00.000Z'),
      updatedAt: new Date('2026-03-24T10:00:00.000Z'),
    });
  });
});
