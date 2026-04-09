import { Repository } from 'typeorm';
import { AuthSession } from '../../auth/entities/auth-session.entity';

export async function revokeActiveSessionsForUser(
  authSessionsRepository: Repository<AuthSession>,
  userId: number,
): Promise<void> {
  const activeSessions = await authSessionsRepository
    .createQueryBuilder('session')
    .leftJoin('session.user', 'user')
    .where('user.id = :userId', { userId })
    .andWhere('session.revokedAt IS NULL')
    .getMany();

  if (activeSessions.length === 0) {
    return;
  }

  const revokedAt = new Date();

  for (const session of activeSessions) {
    session.revokedAt = revokedAt;
  }

  await authSessionsRepository.save(activeSessions);
}
