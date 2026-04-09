import { Role } from '../enums/role.enum';

export type AdminUserItem = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  uo: string;
  role: Role;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};
