import { Role } from '../../users/enums/role.enum';

export type AccessTokenPayload = {
  sub: number;
  sessionId: number;
  email: string;
  role: Role;
  type: 'access';
};

export type RefreshTokenPayload = {
  sub: number;
  sessionId: number;
  type: 'refresh';
};
