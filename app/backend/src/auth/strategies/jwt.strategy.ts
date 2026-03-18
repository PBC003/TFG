import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { AuthSession } from '../entities/auth-session.entity';
import { type PublicUser } from '../auth.service';
import { type AccessTokenPayload } from '../types/token-payload.type';

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
      throw new UnauthorizedException('Invalid access token');
    }

    const session = await this.authSessionsRepository.findOne({
      where: { id: payload.sessionId },
      relations: ['user'],
    });

    if (!session || !session.user) {
      throw new UnauthorizedException('Invalid access token');
    }

    if (session.revokedAt) {
      throw new UnauthorizedException('Session revoked');
    }

    if (session.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedException('Session expired');
    }

    const user = session.user;

    if (!user.isActive) {
      throw new UnauthorizedException('Invalid access token');
    }

    if (user.id !== payload.sub) {
      throw new UnauthorizedException('Invalid access token');
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
