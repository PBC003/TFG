import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import type { AppErrorBody } from '../../common/errors/app-http.exception';
import type { AppErrorCode } from '../../common/errors/app-error-code.type';
import { AuthSession } from '../entities/auth-session.entity';
import { type PublicUser } from '../auth.service';
import { type AccessTokenPayload } from '../types/token-payload.type';

function buildErrorBody(
  code: AppErrorCode,
  message: string,
  details?: Record<string, unknown>,
): AppErrorBody {
  if (details === undefined) {
    return { code, message };
  }

  return { code, message, details };
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(AuthSession)
    private readonly authSessionsRepository: Repository<AuthSession>,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('auth.accessSecret'),
    });
  }

  async validate(payload: AccessTokenPayload): Promise<PublicUser> {
    if (payload.type !== 'access') {
      throw new HttpException(
        buildErrorBody('auth.invalid_access_token', 'Invalid access token'),
        HttpStatus.UNAUTHORIZED,
      );
    }

    const session = await this.authSessionsRepository.findOne({
      where: { id: payload.sessionId },
      relations: ['user'],
    });

    if (!session || !session.user) {
      throw new HttpException(
        buildErrorBody('auth.invalid_access_token', 'Invalid access token'),
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (session.revokedAt) {
      throw new HttpException(
        buildErrorBody('auth.invalid_access_token', 'Session revoked'),
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (session.expiresAt.getTime() <= Date.now()) {
      throw new HttpException(
        buildErrorBody('auth.invalid_access_token', 'Session expired'),
        HttpStatus.UNAUTHORIZED,
      );
    }

    const user = session.user;

    if (!user.isActive) {
      throw new HttpException(
        buildErrorBody('auth.invalid_access_token', 'Invalid access token'),
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (user.id !== payload.sub) {
      throw new HttpException(
        buildErrorBody('auth.invalid_access_token', 'Invalid access token'),
        HttpStatus.UNAUTHORIZED,
      );
    }

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
}
