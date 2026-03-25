import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import type { CookieOptions } from 'express';
import { QueryFailedError, Repository } from 'typeorm';
import {
  extractUoFromEmail,
  isValidInstitutionalEmail,
  normalizeInstitutionalEmail,
} from '../common/utils/email.util';
import { User } from '../users/entities/user.entity';
import { Role } from '../users/enums/role.enum';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthSession } from './entities/auth-session.entity';
import {
  AccessTokenPayload,
  RefreshTokenPayload,
} from './types/token-payload.type';
import { compareSecret, hashSecret } from './utils/password.util';
import {
  addDurationToDate,
  parseDurationToMs,
  type DurationString,
} from './utils/duration.util';

export type PublicUser = Pick<
  User,
  | 'id'
  | 'firstName'
  | 'lastName'
  | 'email'
  | 'uo'
  | 'role'
  | 'isActive'
  | 'createdAt'
  | 'updatedAt'
>;

export type AuthTokensResponse = {
  accessToken: string;
  refreshToken: string;
  user: PublicUser;
};

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(AuthSession)
    private readonly authSessionsRepository: Repository<AuthSession>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ user: PublicUser }> {
    const normalizedEmail = normalizeInstitutionalEmail(registerDto.email);

    if (!isValidInstitutionalEmail(normalizedEmail)) {
      throw new BadRequestException('Invalid UniOvi institutional email');
    }

    const uo = extractUoFromEmail(normalizedEmail);

    const existingUser = await this.usersRepository.findOne({
      where: [{ email: normalizedEmail }, { uo }],
    });

    if (existingUser) {
      throw new ConflictException('A user with that email already exists');
    }

    const passwordHash = await hashSecret(registerDto.password);

    const user = this.usersRepository.create({
      firstName: registerDto.firstName.trim(),
      lastName: registerDto.lastName.trim(),
      email: normalizedEmail,
      uo,
      passwordHash,
      role: Role.STUDENT,
      isActive: true,
      lastLoginAt: null,
    });

    try {
      const savedUser = await this.usersRepository.save(user);

      return {
        user: this.toPublicUser(savedUser),
      };
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error as QueryFailedError & { driverError?: { code?: string } })
          .driverError?.code === 'ER_DUP_ENTRY'
      ) {
        throw new ConflictException('A user with that email already exists');
      }

      throw new InternalServerErrorException('Failed to register user');
    }
  }

  async login(loginDto: LoginDto): Promise<AuthTokensResponse> {
    const normalizedEmail = normalizeInstitutionalEmail(loginDto.email);

    const user = await this.usersRepository.findOne({
      where: { email: normalizedEmail },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await compareSecret(
      loginDto.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.issueTokensForUser(user);
  }

  async refresh(refreshToken: string): Promise<AuthTokensResponse> {
    const payload = await this.verifyRefreshToken(refreshToken);

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const session = await this.authSessionsRepository.findOne({
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

    const newAccessToken = await this.signAccessToken(session.user, session.id);
    const newRefreshToken = await this.signRefreshToken(
      session.user,
      session.id,
    );
    const newRefreshTokenHash = await hashSecret(newRefreshToken);
    const newRefreshExpiresAt = this.getRefreshTokenExpiresAt();

    session.refreshTokenHash = newRefreshTokenHash;
    session.expiresAt = newRefreshExpiresAt;

    await this.authSessionsRepository.save(session);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: this.toPublicUser(session.user),
    };
  }

  async logout(refreshToken: string): Promise<void> {
    const payload = await this.tryVerifyRefreshToken(refreshToken);

    if (!payload || payload.type !== 'refresh') {
      return;
    }

    const session = await this.authSessionsRepository.findOne({
      where: { id: payload.sessionId },
    });

    if (!session || session.revokedAt) {
      return;
    }

    const refreshMatches = await compareSecret(
      refreshToken,
      session.refreshTokenHash,
    );

    if (!refreshMatches) {
      return;
    }

    session.revokedAt = new Date();
    await this.authSessionsRepository.save(session);
  }

  async changePassword(
    userId: number,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const currentPasswordMatches = await compareSecret(
      changePasswordDto.currentPassword,
      user.passwordHash,
    );

    if (!currentPasswordMatches) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const newPasswordMatchesCurrent = await compareSecret(
      changePasswordDto.newPassword,
      user.passwordHash,
    );

    if (newPasswordMatchesCurrent) {
      throw new BadRequestException(
        'New password must be different from current password',
      );
    }

    user.passwordHash = await hashSecret(changePasswordDto.newPassword);
    await this.usersRepository.save(user);

    const activeSessions = await this.authSessionsRepository
      .createQueryBuilder('session')
      .leftJoin('session.user', 'user')
      .where('user.id = :userId', { userId })
      .andWhere('session.revokedAt IS NULL')
      .getMany();

    if (activeSessions.length > 0) {
      const revokedAt = new Date();

      for (const session of activeSessions) {
        session.revokedAt = revokedAt;
      }

      await this.authSessionsRepository.save(activeSessions);
    }
  }

  async signAccessToken(user: User, sessionId: number): Promise<string> {
    const payload: AccessTokenPayload = {
      sub: user.id,
      sessionId,
      email: user.email,
      role: user.role,
      type: 'access',
    };

    const accessExpiresIn = (this.configService.get<string>(
      'auth.accessExpiresIn',
    ) ?? '15m') as DurationString;

    return this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>('auth.accessSecret'),
      expiresIn: accessExpiresIn,
    });
  }

  async signRefreshToken(user: User, sessionId: number): Promise<string> {
    const payload: RefreshTokenPayload = {
      sub: user.id,
      sessionId,
      type: 'refresh',
    };

    const refreshExpiresIn = (this.configService.get<string>(
      'auth.refreshExpiresIn',
    ) ?? '7d') as DurationString;

    return this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>('auth.refreshSecret'),
      expiresIn: refreshExpiresIn,
    });
  }

  getRefreshTokenExpiresAt(from = new Date()): Date {
    const refreshExpiresIn = (this.configService.get<string>(
      'auth.refreshExpiresIn',
    ) ?? '7d') as DurationString;

    return addDurationToDate(refreshExpiresIn, from);
  }

  getRefreshCookieName(): string {
    return (
      this.configService.get<string>('auth.refreshCookieName') ??
      'refresh_token'
    );
  }

  getRefreshCookieOptions(): CookieOptions {
    const refreshExpiresIn = (this.configService.get<string>(
      'auth.refreshExpiresIn',
    ) ?? '7d') as DurationString;

    return {
      ...this.getRefreshCookieClearOptions(),
      maxAge: parseDurationToMs(refreshExpiresIn),
    };
  }

  getRefreshCookieClearOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: this.configService.get<boolean>('auth.cookieSecure') ?? false,
      sameSite:
        this.configService.get<CookieOptions['sameSite']>(
          'auth.cookieSameSite',
        ) ?? 'lax',
      path: '/',
    };
  }

  toPublicUser(user: User): PublicUser {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      uo: user.uo,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private async issueTokensForUser(user: User): Promise<AuthTokensResponse> {
    const now = new Date();
    const refreshExpiresAt = this.getRefreshTokenExpiresAt(now);

    const placeholderHash = await hashSecret(
      `pending-${user.id}-${now.toISOString()}`,
    );

    const session = this.authSessionsRepository.create({
      user,
      refreshTokenHash: placeholderHash,
      expiresAt: refreshExpiresAt,
      revokedAt: null,
    });

    const savedSession = await this.authSessionsRepository.save(session);

    const accessToken = await this.signAccessToken(user, savedSession.id);
    const refreshToken = await this.signRefreshToken(user, savedSession.id);
    const refreshTokenHash = await hashSecret(refreshToken);

    savedSession.refreshTokenHash = refreshTokenHash;
    savedSession.expiresAt = refreshExpiresAt;

    await this.authSessionsRepository.save(savedSession);

    user.lastLoginAt = now;
    await this.usersRepository.save(user);

    return {
      accessToken,
      refreshToken,
      user: this.toPublicUser(user),
    };
  }

  private async verifyRefreshToken(
    refreshToken: string,
  ): Promise<RefreshTokenPayload> {
    try {
      return await this.jwtService.verifyAsync<RefreshTokenPayload>(
        refreshToken,
        {
          secret: this.configService.getOrThrow<string>('auth.refreshSecret'),
        },
      );
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async tryVerifyRefreshToken(
    refreshToken: string,
  ): Promise<RefreshTokenPayload | null> {
    try {
      return await this.jwtService.verifyAsync<RefreshTokenPayload>(
        refreshToken,
        {
          secret: this.configService.getOrThrow<string>('auth.refreshSecret'),
        },
      );
    } catch {
      return null;
    }
  }
}
