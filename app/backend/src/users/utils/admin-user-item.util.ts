import { User } from '../entities/user.entity';
import { AdminUserItem } from '../types/admin-user-item.type';

export function toAdminUserItem(user: User): AdminUserItem {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    uo: user.uo,
    role: user.role,
    isActive: user.isActive,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
