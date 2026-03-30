import { User } from '../../users/entities/user.entity';

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
