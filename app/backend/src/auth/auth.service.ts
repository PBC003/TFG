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
import type {
  AuthTokensResponse,
  PublicUser,
} from './types/auth-response.type';
import type { RefreshTokenPayload } from './types/token-payload.type';
import {
  findRefreshSessionForLogout,
  getValidatedRefreshSession,
  issueTokensForUser,
  revokeActiveUserSessions,
  revokeRefreshSession,
  rotateRefreshSessionTokens,
} from './utils/auth-session.util';
import {
  getRefreshCookieClearOptions,
  getRefreshCookieName,
  getRefreshCookieOptions,
  getRefreshTokenExpiresAt,
  signAccessToken,
  signRefreshToken,
  tryVerifyRefreshToken,
  verifyRefreshToken,
} from './utils/auth-token.util';
import { compareSecret, hashSecret } from './utils/password.util';
import { toPublicUser } from './utils/public-user.util';

export type {
  AuthTokensResponse,
  PublicUser,
} from './types/auth-response.type';

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
        user: toPublicUser(savedUser),
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

    return issueTokensForUser({
      user,
      authSessionsRepository: this.authSessionsRepository,
      usersRepository: this.usersRepository,
      signAccessToken: (targetUser, sessionId) =>
        this.signAccessToken(targetUser, sessionId),
      signRefreshToken: (targetUser, sessionId) =>
        this.signRefreshToken(targetUser, sessionId),
      getRefreshTokenExpiresAt: (from) => this.getRefreshTokenExpiresAt(from),
      toPublicUser,
    });
  }

  async refresh(refreshToken: string): Promise<AuthTokensResponse> {
    const session = await getValidatedRefreshSession({
      refreshToken,
      authSessionsRepository: this.authSessionsRepository,
      verifyRefreshToken: (token) => this.verifyRefreshToken(token),
    });

    return rotateRefreshSessionTokens({
      session,
      authSessionsRepository: this.authSessionsRepository,
      signAccessToken: (user, sessionId) =>
        this.signAccessToken(user, sessionId),
      signRefreshToken: (user, sessionId) =>
        this.signRefreshToken(user, sessionId),
      getRefreshTokenExpiresAt: (from) => this.getRefreshTokenExpiresAt(from),
      toPublicUser,
    });
  }

  async logout(refreshToken: string): Promise<void> {
    const session = await findRefreshSessionForLogout({
      refreshToken,
      authSessionsRepository: this.authSessionsRepository,
      tryVerifyRefreshToken: (token) => this.tryVerifyRefreshToken(token),
    });

    if (!session) {
      return;
    }

    await revokeRefreshSession(this.authSessionsRepository, session);
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

    await revokeActiveUserSessions({
      userId,
      authSessionsRepository: this.authSessionsRepository,
    });
  }

  async signAccessToken(user: User, sessionId: number): Promise<string> {
    return signAccessToken(
      this.jwtService,
      this.configService,
      user,
      sessionId,
    );
  }

  async signRefreshToken(user: User, sessionId: number): Promise<string> {
    return signRefreshToken(
      this.jwtService,
      this.configService,
      user,
      sessionId,
    );
  }

  getRefreshTokenExpiresAt(from = new Date()): Date {
    return getRefreshTokenExpiresAt(this.configService, from);
  }

  getRefreshCookieName(): string {
    return getRefreshCookieName(this.configService);
  }

  getRefreshCookieOptions(): CookieOptions {
    return getRefreshCookieOptions(this.configService);
  }

  getRefreshCookieClearOptions(): CookieOptions {
    return getRefreshCookieClearOptions(this.configService);
  }

  private async verifyRefreshToken(
    refreshToken: string,
  ): Promise<RefreshTokenPayload> {
    return verifyRefreshToken(
      this.jwtService,
      this.configService,
      refreshToken,
    );
  }

  private async tryVerifyRefreshToken(
    refreshToken: string,
  ): Promise<RefreshTokenPayload | null> {
    return tryVerifyRefreshToken(
      this.jwtService,
      this.configService,
      refreshToken,
    );
  }
}
