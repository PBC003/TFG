import { UnauthorizedException } from '@nestjs/common';
import type { Repository } from 'typeorm';
import type { User } from '../../users/entities/user.entity';
import { AuthSession } from '../entities/auth-session.entity';
import type {
  AuthTokensResponse,
  PublicUser,
} from '../types/auth-response.type';
import type { RefreshTokenPayload } from '../types/token-payload.type';
import { compareSecret, hashSecret } from './password.util';

export type AuthSessionRepository = Pick<
  Repository<AuthSession>,
  'create' | 'save' | 'findOne' | 'createQueryBuilder'
>;

export type UserWriteRepository = Pick<Repository<User>, 'save'>;

export async function issueTokensForUser(params: {
  user: User;
  authSessionsRepository: AuthSessionRepository;
  usersRepository: UserWriteRepository;
  signAccessToken: (user: User, sessionId: number) => Promise<string>;
  signRefreshToken: (user: User, sessionId: number) => Promise<string>;
  getRefreshTokenExpiresAt: (from?: Date) => Date;
  toPublicUser: (user: User) => PublicUser;
}): Promise<AuthTokensResponse> {
  const {
    user,
    authSessionsRepository,
    usersRepository,
    signAccessToken,
    signRefreshToken,
    getRefreshTokenExpiresAt,
    toPublicUser,
  } = params;

  const now = new Date();
  const refreshExpiresAt = getRefreshTokenExpiresAt(now);
  const placeholderHash = await hashSecret(
    `pending-${user.id}-${now.toISOString()}`,
  );

  const session = authSessionsRepository.create({
    user,
    refreshTokenHash: placeholderHash,
    expiresAt: refreshExpiresAt,
    revokedAt: null,
  });

  const savedSession = await authSessionsRepository.save(session);
  const accessToken = await signAccessToken(user, savedSession.id);
  const refreshToken = await signRefreshToken(user, savedSession.id);

  savedSession.refreshTokenHash = await hashSecret(refreshToken);
  savedSession.expiresAt = refreshExpiresAt;
  await authSessionsRepository.save(savedSession);

  user.lastLoginAt = now;
  await usersRepository.save(user);

  return {
    accessToken,
    refreshToken,
    user: toPublicUser(user),
  };
}

export async function getValidatedRefreshSession(params: {
  refreshToken: string;
  authSessionsRepository: AuthSessionRepository;
  verifyRefreshToken: (refreshToken: string) => Promise<RefreshTokenPayload>;
}): Promise<AuthSession> {
  const { refreshToken, authSessionsRepository, verifyRefreshToken } = params;
  const payload = await verifyRefreshToken(refreshToken);

  if (payload.type !== 'refresh') {
    throw new UnauthorizedException('Invalid refresh token');
  }

  const session = await authSessionsRepository.findOne({
    where: { id: payload.sessionId },
    relations: ['user'],
  });

  if (!session || !session.user) {
    throw new UnauthorizedException('Invalid refresh token');
  }

  if (session.revokedAt) {
    throw new UnauthorizedException('Refresh session revoked');
  }

  if (session.expiresAt.getTime() <= Date.now()) {
    throw new UnauthorizedException('Refresh session expired');
  }

  if (!session.user.isActive) {
    throw new UnauthorizedException('Invalid refresh token');
  }

  const refreshMatches = await compareSecret(
    refreshToken,
    session.refreshTokenHash,
  );

  if (!refreshMatches) {
    throw new UnauthorizedException('Invalid refresh token');
  }

  return session;
}

export async function rotateRefreshSessionTokens(params: {
  session: AuthSession;
  authSessionsRepository: AuthSessionRepository;
  signAccessToken: (user: User, sessionId: number) => Promise<string>;
  signRefreshToken: (user: User, sessionId: number) => Promise<string>;
  getRefreshTokenExpiresAt: (from?: Date) => Date;
  toPublicUser: (user: User) => PublicUser;
}): Promise<AuthTokensResponse> {
  const {
    session,
    authSessionsRepository,
    signAccessToken,
    signRefreshToken,
    getRefreshTokenExpiresAt,
    toPublicUser,
  } = params;

  const accessToken = await signAccessToken(session.user, session.id);
  const refreshToken = await signRefreshToken(session.user, session.id);

  session.refreshTokenHash = await hashSecret(refreshToken);
  session.expiresAt = getRefreshTokenExpiresAt();
  await authSessionsRepository.save(session);

  return {
    accessToken,
    refreshToken,
    user: toPublicUser(session.user),
  };
}

export async function findRefreshSessionForLogout(params: {
  refreshToken: string;
  authSessionsRepository: AuthSessionRepository;
  tryVerifyRefreshToken: (
    refreshToken: string,
  ) => Promise<RefreshTokenPayload | null>;
}): Promise<AuthSession | null> {
  const { refreshToken, authSessionsRepository, tryVerifyRefreshToken } =
    params;
  const payload = await tryVerifyRefreshToken(refreshToken);

  if (!payload || payload.type !== 'refresh') {
    return null;
  }

  const session = await authSessionsRepository.findOne({
    where: { id: payload.sessionId },
  });

  if (!session || session.revokedAt) {
    return null;
  }

  const refreshMatches = await compareSecret(
    refreshToken,
    session.refreshTokenHash,
  );

  return refreshMatches ? session : null;
}

export async function revokeRefreshSession(
  authSessionsRepository: Pick<Repository<AuthSession>, 'save'>,
  session: AuthSession,
  revokedAt = new Date(),
): Promise<void> {
  session.revokedAt = revokedAt;
  await authSessionsRepository.save(session);
}

export async function revokeActiveUserSessions(params: {
  userId: number;
  authSessionsRepository: AuthSessionRepository;
  revokedAt?: Date;
}): Promise<void> {
  const { userId, authSessionsRepository, revokedAt = new Date() } = params;

  const activeSessions = await authSessionsRepository
    .createQueryBuilder('session')
    .leftJoin('session.user', 'user')
    .where('user.id = :userId', { userId })
    .andWhere('session.revokedAt IS NULL')
    .getMany();

  if (activeSessions.length === 0) {
    return;
  }

  for (const session of activeSessions) {
    session.revokedAt = revokedAt;
  }

  await authSessionsRepository.save(activeSessions);
}
