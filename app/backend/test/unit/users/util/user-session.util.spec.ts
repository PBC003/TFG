import { revokeActiveSessionsForUser } from '../../../../src/users/utils/user-session.util';

describe('user-session.util', () => {
  const createRepositoryMock = (
    sessions: Array<{ revokedAt: Date | null }>,
  ) => {
    const queryBuilder = {
      leftJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue(sessions),
    };

    return {
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
      save: jest.fn().mockResolvedValue(undefined),
      queryBuilder,
    };
  };

  it('returns early when there are no active sessions', async () => {
    const repository = createRepositoryMock([]);

    await revokeActiveSessionsForUser(repository as never, 7);

    expect(repository.createQueryBuilder).toHaveBeenCalledWith('session');
    expect(repository.queryBuilder.leftJoin).toHaveBeenCalledWith(
      'session.user',
      'user',
    );
    expect(repository.queryBuilder.where).toHaveBeenCalledWith(
      'user.id = :userId',
      { userId: 7 },
    );
    expect(repository.queryBuilder.andWhere).toHaveBeenCalledWith(
      'session.revokedAt IS NULL',
    );
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('revokes all active sessions with the same timestamp', async () => {
    const sessions = [{ revokedAt: null }, { revokedAt: null }];
    const repository = createRepositoryMock(sessions);

    await revokeActiveSessionsForUser(repository as never, 7);

    expect(repository.save).toHaveBeenCalledWith(sessions);
    expect(sessions[0].revokedAt).toBeInstanceOf(Date);
    expect(sessions[1].revokedAt).toBe(sessions[0].revokedAt);
  });
});
