import { HttpStatus } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { QueryFailedError, Repository } from 'typeorm';
import { AuthSession } from '../../../src/auth/entities/auth-session.entity';
import { User } from '../../../src/users/entities/user.entity';
import { Role } from '../../../src/users/enums/role.enum';
import { UsersService } from '../../../src/users/users.service';
import * as passwordUtil from '../../../src/auth/utils/password.util';

jest.mock('../../../src/auth/utils/password.util', () => ({
  hashSecret: jest.fn((value: string) => Promise.resolve(`hashed:${value}`)),
}));

const hashSecretMock = jest.mocked(passwordUtil.hashSecret);

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: jest.Mocked<Repository<User>> & {
    manager: { transaction: jest.Mock };
  };
  let authSessionsRepository: jest.Mocked<Repository<AuthSession>>;

  beforeEach(async () => {
    hashSecretMock.mockClear();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            softDelete: jest.fn(),
            manager: {
              transaction: jest.fn(),
            },
          },
        },
        {
          provide: getRepositoryToken(AuthSession),
          useValue: {
            save: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(UsersService);
    usersRepository = module.get(getRepositoryToken(User));
    authSessionsRepository = module.get(getRepositoryToken(AuthSession));
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

  function mockActiveSessions(sessions: AuthSession[]) {
    const queryBuilder = {
      leftJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue(sessions),
    };
    authSessionsRepository.createQueryBuilder.mockReturnValue(
      queryBuilder as never,
    );
    return queryBuilder;
  }

  it('lists and maps users in ascending id order', async () => {
    const users = [
      buildUser({ id: 2 }),
      buildUser({ id: 5, role: Role.ADMIN }),
    ];
    usersRepository.find.mockResolvedValue(users);

    await expect(service.listUsers()).resolves.toEqual([
      expect.objectContaining({ id: 2 }),
      expect.objectContaining({ id: 5, role: Role.ADMIN }),
    ]);
    expect(usersRepository.find).toHaveBeenCalledWith({ order: { id: 'ASC' } });
  });

  it('throws a normalized not-found error when the user does not exist', async () => {
    usersRepository.findOne.mockResolvedValue(null);

    await expect(service.findUserById(9)).rejects.toMatchObject({
      response: {
        code: 'user.not_found',
        message: 'User not found',
      },
      status: HttpStatus.NOT_FOUND,
    });
  });

  it('updates identity fields with normalization and duplicate protection', async () => {
    const user = buildUser();
    const savedUser = buildUser({
      firstName: 'Paula',
      lastName: 'Llaneza',
      email: 'uo654321@uniovi.es',
      uo: 'UO654321',
    });
    usersRepository.findOne
      .mockResolvedValueOnce(user)
      .mockResolvedValueOnce(null);
    usersRepository.save.mockResolvedValue(savedUser);

    await expect(
      service.updateUser(1, {
        firstName: '  Paula  ',
        lastName: '  Llaneza  ',
        email: ' UO654321@UniOvi.es ',
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        firstName: 'Paula',
        lastName: 'Llaneza',
        email: 'uo654321@uniovi.es',
        uo: 'UO654321',
      }),
    );
  });

  it('rejects invalid update payloads and conflicting emails', async () => {
    usersRepository.findOne.mockResolvedValue(buildUser());

    await expect(service.updateUser(1, {})).rejects.toMatchObject({
      response: {
        code: 'user.update_requires_field',
      },
      status: HttpStatus.BAD_REQUEST,
    });

    await expect(
      service.updateUser(1, { firstName: 'A' }),
    ).rejects.toMatchObject({
      response: {
        code: 'user.invalid_first_name_length',
      },
      status: HttpStatus.BAD_REQUEST,
    });

    await expect(
      service.updateUser(1, { email: 'invalid@example.com' }),
    ).rejects.toMatchObject({
      response: {
        code: 'auth.invalid_institutional_email',
      },
      status: HttpStatus.BAD_REQUEST,
    });

    usersRepository.findOne
      .mockResolvedValueOnce(buildUser())
      .mockResolvedValueOnce(
        buildUser({ id: 3, email: 'uo654321@uniovi.es', uo: 'UO654321' }),
      );

    await expect(
      service.updateUser(1, { email: 'uo654321@uniovi.es' }),
    ).rejects.toMatchObject({
      response: {
        code: 'user.email_already_exists',
      },
      status: HttpStatus.CONFLICT,
    });
  });

  it('maps duplicate key and unexpected save failures during user updates', async () => {
    usersRepository.findOne
      .mockResolvedValueOnce(buildUser())
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(buildUser())
      .mockResolvedValueOnce(null);

    usersRepository.save
      .mockRejectedValueOnce(
        new QueryFailedError('UPDATE', [], { code: 'ER_DUP_ENTRY' } as never),
      )
      .mockRejectedValueOnce(new Error('boom'));

    await expect(
      service.updateUser(1, { email: 'uo654321@uniovi.es' }),
    ).rejects.toMatchObject({
      response: { code: 'user.email_already_exists' },
      status: HttpStatus.CONFLICT,
    });

    await expect(
      service.updateUser(1, { email: 'uo654321@uniovi.es' }),
    ).rejects.toMatchObject({
      response: { code: 'user.update_failed' },
      status: HttpStatus.INTERNAL_SERVER_ERROR,
    });
  });

  it('updates role and activation status for existing users', async () => {
    const user = buildUser();
    usersRepository.findOne.mockResolvedValue(user);
    usersRepository.save.mockResolvedValue(user);

    await expect(service.updateUserRole(1, Role.ADMIN)).resolves.toEqual(
      expect.objectContaining({ role: Role.ADMIN }),
    );
    await expect(service.updateUserStatus(1, false)).resolves.toEqual(
      expect.objectContaining({ isActive: false }),
    );
  });

  it('updates passwords, hashes the new secret and revokes active sessions', async () => {
    const user = buildUser();
    const session = Object.assign(new AuthSession(), {
      id: 4,
      revokedAt: null,
    });
    usersRepository.findOne.mockResolvedValue(user);
    usersRepository.save.mockResolvedValue(user);
    mockActiveSessions([session]);

    await expect(
      service.updateUserPassword(1, 'password456'),
    ).resolves.toBeUndefined();

    expect(usersRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ passwordHash: 'hashed:password456' }),
    );
    expect(authSessionsRepository.save).toHaveBeenCalledWith([
      expect.objectContaining({ revokedAt: expect.any(Date) }),
    ]);
  });

  it('rejects password resets for missing users or weak passwords', async () => {
    usersRepository.findOne.mockResolvedValue(null);
    await expect(
      service.updateUserPassword(1, 'password456'),
    ).rejects.toMatchObject({
      response: { code: 'user.not_found' },
      status: HttpStatus.NOT_FOUND,
    });

    usersRepository.findOne.mockResolvedValue(buildUser());
    await expect(service.updateUserPassword(1, 'short')).rejects.toMatchObject({
      response: { code: 'user.password_too_short' },
      status: HttpStatus.BAD_REQUEST,
    });
  });

  it('deletes users inside a transaction, deactivates them and revokes sessions first', async () => {
    const user = buildUser();
    const usersRepoInTx = {
      findOne: jest.fn().mockResolvedValue(user),
      save: jest.fn().mockResolvedValue(user),
      softDelete: jest.fn().mockResolvedValue(undefined),
    };
    const authSessionsRepoInTx = {
      save: jest.fn().mockResolvedValue(undefined),
      createQueryBuilder: jest.fn(),
    };
    const queryBuilder = {
      leftJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest
        .fn()
        .mockResolvedValue([
          Object.assign(new AuthSession(), { id: 10, revokedAt: null }),
        ]),
    };
    authSessionsRepoInTx.createQueryBuilder.mockReturnValue(queryBuilder);

    const manager = {
      getRepository: jest.fn((entity) => {
        if (entity === User) {
          return usersRepoInTx;
        }
        return authSessionsRepoInTx;
      }),
    };
    usersRepository.manager.transaction.mockImplementation(async (callback) =>
      callback(manager as never),
    );

    await expect(service.deleteUser(1)).resolves.toBeUndefined();

    expect(usersRepoInTx.save).toHaveBeenCalledWith(
      expect.objectContaining({ isActive: false }),
    );
    expect(authSessionsRepoInTx.save).toHaveBeenCalledWith([
      expect.objectContaining({ revokedAt: expect.any(Date) }),
    ]);
    expect(usersRepoInTx.softDelete).toHaveBeenCalledWith(1);
  });
});
